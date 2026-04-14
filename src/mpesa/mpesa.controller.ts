import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { MpesaService } from './mpesa.service';

@Controller('api/mpesa')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);

  constructor(private readonly mpesaService: MpesaService) {}

  @Get('stk-configured')
  stkConfigured() {
    return { configured: this.mpesaService.isConfigured() };
  }

  @Post('stk-push')
  async stkPush(@Body() body: { orderId?: unknown; phoneNumber?: unknown }) {
    this.logger.log(
      `POST stk-push body keys=${Object.keys(body ?? {}).join(',')} orderId=${String(body?.orderId)}`,
    );
    const orderId = Number(body.orderId);
    const phoneNumber = typeof body.phoneNumber === 'string' ? body.phoneNumber : '';
    if (!Number.isFinite(orderId) || orderId < 1) {
      this.logger.warn(`stk-push 400: invalid orderId raw=${JSON.stringify(body?.orderId)}`);
      throw new BadRequestException('orderId is required');
    }
    if (!phoneNumber.trim()) {
      this.logger.warn('stk-push 400: missing phoneNumber');
      throw new BadRequestException('phoneNumber is required');
    }
    try {
      return await this.mpesaService.initiateStkPush(orderId, phoneNumber);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`stk-push failed orderId=${orderId}: ${msg}`);
      throw e;
    }
  }

  @Get('order-payment-status')
  async orderPaymentStatus(
    @Query('orderId') orderIdRaw: string,
    @Query('checkoutRequestId') checkoutRequestId: string,
  ) {
    const orderId = Number(orderIdRaw);
    if (!Number.isFinite(orderId) || orderId < 1) {
      throw new BadRequestException('orderId is required');
    }
    if (!checkoutRequestId?.trim()) {
      throw new BadRequestException('checkoutRequestId is required');
    }
    const status = await this.mpesaService.getOrderPaymentStatus(
      orderId,
      checkoutRequestId.trim(),
    );
    if (!status) {
      throw new BadRequestException('Order not found');
    }
    return status;
  }

  /** Safaricom Daraja STK callback (must be reachable at MPESA_CALLBACK_URL). */
  @Post('stk-callback')
  @HttpCode(200)
  async stkCallback(@Body() body: Record<string, unknown>) {
    try {
      await this.mpesaService.handleStkCallback(body);
    } catch (e) {
      console.error('M-Pesa stk-callback handler error:', e);
    }
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }
}
