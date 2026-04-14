import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, PaymentStatus } from '../entities/order.entity';

function mpesaBaseUrl(env: string | undefined): string {
  const e = (env ?? '').trim().toLowerCase();
  return e === 'production' || e === 'prod'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

export function normalizeKenyaPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length >= 12) {
    return digits.slice(0, 12);
  }
  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `254${digits}`;
  }
  return null;
}

function stkTimestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

/** Trim .env values: CRLF, BOM, accidental wrapping quotes (common on Windows). */
function sanitizeEnvString(v: string | undefined): string | undefined {
  if (v == null) return undefined;
  let s = v.trim().replace(/^\uFEFF/, '').replace(/\r/g, '');
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s.length > 0 ? s : undefined;
}

type DarajaConfig = {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  /** Business / head-office short code (STK password uses this + passkey + timestamp). */
  shortcode: string;
  /** Party B in STK body; defaults to shortcode if MPESA_PARTY_B unset. */
  partyB: string;
  callbackUrl: string;
  env: string;
  txType: string;
};

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly config: ConfigService,
  ) {}

  /** Read Daraja HTTP body; logs status/length/preview (never logs passkey or Bearer token). */
  private async parseDarajaResponse<T>(res: Response, context: string): Promise<T> {
    const text = await res.text();
    const len = text.length;
    const preview = text.trim().slice(0, 500).replace(/\s+/g, ' ');
    const ct = res.headers.get('content-type') ?? 'n/a';
    this.logger.log(
      `[${context}] http=${res.status} ${res.statusText} content-type=${ct} bodyBytes=${len}`,
    );
    if (preview.length > 0) {
      this.logger.log(`[${context}] bodyPreview=${preview}${len > 500 ? '…' : ''}`);
    }
    const trimmed = text.trim();
    if (!trimmed) {
      this.logger.error(
        `[${context}] empty body http=${res.status} — often invalid OAuth credentials or sandbox/prod mismatch`,
      );
      if (context.includes('OAuth') && (res.status === 400 || res.status === 401)) {
        throw new BadRequestException(
          'M-Pesa OAuth: Safaricom returned HTTP ' +
            res.status +
            ' with an empty body. That usually means Consumer Key / Consumer Secret are invalid for this host, or you are using Sandbox Daraja keys while MPESA_ENV=production (or production keys on sandbox). Fix: (1) For live payments use keys from a Go Live app on developer.safaricom.co.ke with MPESA_ENV=production. (2) For testing use MPESA_ENV=sandbox and Sandbox app keys. (3) In .env remove quotes around secrets and hidden \\r characters (save as UTF-8 LF).',
        );
      }
      throw new BadRequestException(
        `${context}: empty response (HTTP ${res.status} ${res.statusText}). Check network/firewall, TLS, and that MPESA_ENV matches your Daraja app (sandbox vs production).`,
      );
    }
    try {
      return JSON.parse(trimmed) as T;
    } catch (e) {
      this.logger.error(
        `[${context}] JSON.parse failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new BadRequestException(
        `${context}: response was not JSON (HTTP ${res.status}): ${trimmed.slice(0, 280)}`,
      );
    }
  }

  private darajaConfig(): DarajaConfig | null {
    const consumerKey = sanitizeEnvString(this.config.get<string>('MPESA_CONSUMER_KEY'));
    const consumerSecret = sanitizeEnvString(this.config.get<string>('MPESA_CONSUMER_SECRET'));
    const passkey = sanitizeEnvString(this.config.get<string>('MPESA_PASSKEY'));
    const shortcode = sanitizeEnvString(this.config.get<string>('MPESA_SHORTCODE'));
    const partyBRaw =
      sanitizeEnvString(this.config.get<string>('MPESA_PARTY_B')) || shortcode || '';
    const callbackUrl = sanitizeEnvString(this.config.get<string>('MPESA_CALLBACK_URL'));
    const env = (this.config.get<string>('MPESA_ENV') || 'sandbox').trim().toLowerCase();
    const txType = (
      this.config.get<string>('MPESA_TRANSACTION_TYPE') || 'CustomerPayBillOnline'
    ).trim();

    if (!consumerKey || !consumerSecret || !passkey || !shortcode || !callbackUrl) {
      return null;
    }
    const partyB = String(partyBRaw).replace(/\D/g, '');
    if (!partyB) {
      return null;
    }
    return {
      consumerKey,
      consumerSecret,
      passkey,
      shortcode,
      partyB,
      callbackUrl,
      env,
      txType,
    };
  }

  isConfigured(): boolean {
    return this.darajaConfig() !== null;
  }

  async getAccessToken(): Promise<string> {
    const c = this.darajaConfig();
    if (!c) {
      throw new ServiceUnavailableException('M-Pesa is not configured');
    }
    const base = mpesaBaseUrl(c.env);
    const url = `${base}/oauth/v1/generate?grant_type=client_credentials`;
    this.logger.log(
      `[M-Pesa OAuth] requesting token env=${c.env} base=${base} consumerKeyLen=${c.consumerKey.length}`,
    );
    const auth = Buffer.from(`${c.consumerKey}:${c.consumerSecret}`).toString('base64');
    let res: Response;
    try {
      res = await fetch(url, {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
          'User-Agent': 'TassmattBackend/1.0 (Daraja OAuth)',
        },
      });
    } catch (e) {
      this.logger.error(
        `[M-Pesa OAuth] fetch failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new BadRequestException(
        'M-Pesa OAuth: could not reach Safaricom (network/DNS/TLS). See server log for details.',
      );
    }
    const data = await this.parseDarajaResponse<{
      access_token?: string;
      error_description?: string;
      error?: string;
    }>(res, 'M-Pesa OAuth');
    if (!res.ok || !data.access_token) {
      this.logger.warn(
        `[M-Pesa OAuth] rejected http=${res.status} error=${data.error ?? 'n/a'} desc=${data.error_description ?? 'n/a'}`,
      );
      throw new BadRequestException(
        data.error_description ||
          data.error ||
          `M-Pesa OAuth failed (HTTP ${res.status}). Confirm consumer key/secret and MPESA_ENV.`,
      );
    }
    this.logger.log('[M-Pesa OAuth] access_token received');
    return data.access_token;
  }

  async initiateStkPush(orderId: number, phoneNumber: string) {
    this.logger.log(
      `[M-Pesa STK] initiate request orderId=${orderId} phoneDigits=${String(phoneNumber).replace(/\D/g, '').length}`,
    );
    const c = this.darajaConfig();
    if (!c) {
      this.logger.warn('[M-Pesa STK] darajaConfig() returned null — missing env vars');
      throw new ServiceUnavailableException(
        'M-Pesa STK is not configured. Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE, and MPESA_CALLBACK_URL.',
      );
    }

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      this.logger.warn(`[M-Pesa STK] order not found id=${orderId}`);
      throw new BadRequestException('Order not found');
    }
    if (order.paymentMethod !== 'mpesa_stk') {
      this.logger.warn(
        `[M-Pesa STK] wrong paymentMethod order=${order.orderNumber} paymentMethod=${String(order.paymentMethod)}`,
      );
      throw new BadRequestException(
        'This order is not set up for M-Pesa STK (paymentMethod missing or wrong). Run database migration add_mpesa_stk_columns.sql and redeploy.',
      );
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      this.logger.warn(`[M-Pesa STK] already paid order=${order.orderNumber}`);
      throw new BadRequestException('Order is already paid');
    }

    const msisdn = normalizeKenyaPhone(phoneNumber);
    if (!msisdn) {
      this.logger.warn(`[M-Pesa STK] invalid phone raw=${phoneNumber.slice(0, 20)}`);
      throw new BadRequestException('Enter a valid Kenya phone number (e.g. 07XXXXXXXX)');
    }

    const amount = Math.max(1, Math.round(Number(order.total)));
    const maxKesRaw = this.config.get<string>('MPESA_STK_MAX_KES')?.trim();
    const maxKes = maxKesRaw ? parseInt(maxKesRaw, 10) : 250_000;
    const stkMax = Number.isFinite(maxKes) && maxKes > 0 ? maxKes : 250_000;
    if (amount > stkMax) {
      this.logger.warn(
        `[M-Pesa STK] amount over cap order=${order.orderNumber} amount=${amount} max=${stkMax}`,
      );
      throw new BadRequestException(
        `M-Pesa STK allows at most KES ${stkMax.toLocaleString('en-KE')} per payment prompt (Safaricom limit). This order is KES ${amount.toLocaleString('en-KE')}. Use Paybill / Pay online, split the order, or raise MPESA_STK_MAX_KES only if Safaricom has approved a higher limit for your line.`,
      );
    }

    const timestamp = stkTimestamp();
    const shortcodeStr = String(c.shortcode).replace(/\D/g, '');
    const partyBStr = String(c.partyB).replace(/\D/g, '') || shortcodeStr;
    const password = Buffer.from(`${shortcodeStr}${c.passkey}${timestamp}`).toString(
      'base64',
    );

    const accountRef = order.orderNumber.replace(/\s/g, '').slice(0, 20);
    const token = await this.getAccessToken();

    const desc = `Order ${accountRef}`.replace(/\s/g, '').slice(0, 13);

    const payload = {
      BusinessShortCode: parseInt(shortcodeStr, 10),
      Password: password,
      Timestamp: timestamp,
      TransactionType: c.txType,
      Amount: amount,
      PartyA: parseInt(msisdn, 10),
      PartyB: parseInt(partyBStr, 10),
      PhoneNumber: parseInt(msisdn, 10),
      CallBackURL: c.callbackUrl,
      AccountReference: accountRef,
      TransactionDesc: desc,
    };

    let callbackHost = 'invalid-callback-url';
    try {
      callbackHost = new URL(c.callbackUrl).hostname;
    } catch {
      this.logger.error(`[M-Pesa STK] MPESA_CALLBACK_URL is not a valid URL: ${c.callbackUrl.slice(0, 80)}`);
    }
    this.logger.log(
      `[M-Pesa STK] payload order=${order.orderNumber} amount=${amount} BusinessShortCode=${shortcodeStr} PartyB=${partyBStr} TransactionType=${c.txType} Phone=254****${msisdn.slice(-3)} AccountRef=${accountRef} callbackHost=${callbackHost}`,
    );

    const stkUrl = `${mpesaBaseUrl(c.env)}/mpesa/stkpush/v1/processrequest`;
    let stkRes: Response;
    try {
      stkRes = await fetch(stkUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'TassmattBackend/1.0 (Daraja STK)',
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      this.logger.error(
        `[M-Pesa STK] fetch failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      throw new BadRequestException(
        'M-Pesa STK: could not reach Safaricom. See server log for details.',
      );
    }

    const stkJson = await this.parseDarajaResponse<{
      ResponseCode?: string;
      ResponseDescription?: string;
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      errorCode?: string;
      errorMessage?: string;
    }>(stkRes, 'M-Pesa STK push');

    if (!stkRes.ok || stkJson.ResponseCode !== '0') {
      const msg =
        stkJson.ResponseDescription ||
        stkJson.errorMessage ||
        stkJson.errorCode ||
        'STK push request failed';
      this.logger.warn(
        `[M-Pesa STK] rejected http=${stkRes.status} ResponseCode=${stkJson.ResponseCode ?? 'n/a'} desc=${msg} MerchantRequestID=${stkJson.MerchantRequestID ?? 'n/a'}`,
      );
      throw new BadRequestException(msg);
    }

    this.logger.log(
      `[M-Pesa STK] accepted CheckoutRequestID=${stkJson.CheckoutRequestID ?? 'n/a'} order=${order.orderNumber}`,
    );

    order.mpesaCheckoutRequestId = stkJson.CheckoutRequestID ?? null;
    await this.orderRepo.save(order);

    return {
      customerMessage: stkJson.ResponseDescription || 'Success. Request accepted for processing',
      checkoutRequestId: stkJson.CheckoutRequestID,
      merchantRequestId: stkJson.MerchantRequestID,
    };
  }

  async getOrderPaymentStatus(orderId: number, checkoutRequestId: string) {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      return null;
    }
    if (order.mpesaCheckoutRequestId !== checkoutRequestId) {
      this.logger.warn(
        `[M-Pesa status] session mismatch orderId=${orderId} stored=${order.mpesaCheckoutRequestId ?? 'null'} query=${checkoutRequestId.slice(0, 40)}…`,
      );
      throw new BadRequestException('Invalid checkout session');
    }
    return {
      paymentStatus: order.paymentStatus,
      orderNumber: order.orderNumber,
      mpesaReceiptNumber: order.mpesaReceiptNumber,
    };
  }

  async handleStkCallback(body: Record<string, unknown>): Promise<void> {
    const stkCallback = (body as { Body?: { stkCallback?: Record<string, unknown> } }).Body
      ?.stkCallback;
    if (!stkCallback) {
      console.warn('M-Pesa callback: missing Body.stkCallback');
      return;
    }

    const checkoutRequestId = String(stkCallback.CheckoutRequestID || '');
    const resultCode = Number(stkCallback.ResultCode);
    if (!checkoutRequestId) {
      return;
    }

    const order = await this.orderRepo.findOne({
      where: { mpesaCheckoutRequestId: checkoutRequestId },
    });
    if (!order) {
      console.warn(`M-Pesa callback: no order for CheckoutRequestID ${checkoutRequestId}`);
      return;
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      return;
    }

    if (resultCode === 0) {
      const meta = stkCallback.CallbackMetadata as
        | { Item?: { Name: string; Value?: unknown }[] }
        | undefined;
      const items = meta?.Item;
      let receipt: string | null = null;
      if (Array.isArray(items)) {
        const receiptItem = items.find((i) => i.Name === 'MpesaReceiptNumber');
        if (receiptItem?.Value != null) {
          receipt = String(receiptItem.Value);
        }
      }
      order.paymentStatus = PaymentStatus.PAID;
      if (receipt) {
        order.mpesaReceiptNumber = receipt;
      }
      await this.orderRepo.save(order);
      console.log(`M-Pesa STK success for order ${order.orderNumber}, receipt ${receipt}`);
    } else {
      const desc = String(stkCallback.ResultDesc || '');
      console.log(
        `M-Pesa STK customer cancelled or failed for order ${order.orderNumber}: ${resultCode} ${desc}`,
      );
    }
  }
}
