import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { QuotationDbService } from './quotation-db.service';

interface QuotationItemDto {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface RequestQuotationDto {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress?: string;
  notes?: string;
  items: QuotationItemDto[];
  subtotal: number;
  tax: number;
  total: number;
}

let refCounter = 1;

function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const seq = String(refCounter++).padStart(3, '0');
  return `QT-${ts}-${seq}`;
}

@Controller('api/quotations')
export class QuotationController {
  private readonly logger = new Logger(QuotationController.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly quotationDb: QuotationDbService,
  ) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  async requestQuotation(@Body() body: RequestQuotationDto) {
    this.logger.log(
      `Quotation request from ${body.customerEmail} — ${body.items?.length ?? 0} item(s)`,
    );

    if (!body.customerEmail || !body.items?.length) {
      return { success: false, message: 'Email and items are required.' };
    }

    const ref = generateRef();

    try {
      await this.emailService.sendQuotation({
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        deliveryAddress: body.deliveryAddress,
        notes: body.notes,
        items: body.items,
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
        quotationRef: ref,
        validDays: 7,
      });
      this.logger.log(`Quotation ${ref} sent to ${body.customerEmail}`);

      // Persist to the secondary quotation database (non-blocking — email already sent)
      this.quotationDb
        .saveQuotation({
          quotationRef: ref,
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone ?? null,
          deliveryAddress: body.deliveryAddress ?? null,
          notes: body.notes ?? null,
          items: body.items,
          subtotal: body.subtotal,
          tax: body.tax,
          total: body.total,
        })
        .catch((dbErr: unknown) =>
          this.logger.error(
            `DB save failed for ${ref}: ${dbErr instanceof Error ? dbErr.message : String(dbErr)}`,
          ),
        );

      return { success: true, quotationRef: ref };
    } catch (err: unknown) {
      this.logger.error(
        `Failed to send quotation ${ref}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return { success: false, message: 'Failed to send quotation email. Please try again.' };
    }
  }
}
