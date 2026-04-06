import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { createPool, Pool, ResultSetHeader } from 'mysql2/promise';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { Rider } from '../entities/rider.entity';
import { EmailService } from '../email/email.service';

export interface CreateOrderDto {
  userId?: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  billingAddress?: string;
  notes?: string;
  paymentMethod: string;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: string;
  billingAddress?: string;
  notes?: string;
  items: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    total: number;
    product: {
      id: number;
      name: string;
      image: string;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OrdersService {
  private quotationDbPool: Pool | null = null;

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Rider)
    private riderRepository: Repository<Rider>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponse> {
    console.log('Creating order with DTO:', JSON.stringify(createOrderDto, null, 2));
    
    try {
      // Validate items array
      if (!createOrderDto.items || !Array.isArray(createOrderDto.items)) {
        console.error('Invalid items array:', createOrderDto.items);
        throw new Error('Items must be an array');
      }
      
      // Validate customer email
      if (!createOrderDto.customerEmail || !createOrderDto.customerName) {
        throw new Error('Customer email and name are required');
      }
      
      // Find or create user based on email
      let user = await this.userRepository.findOne({
        where: { email: createOrderDto.customerEmail }
      });
      
      if (!user) {
        console.log(`User not found with email ${createOrderDto.customerEmail}, creating new user`);
        // Parse customer name (assuming format: "FirstName LastName")
        const nameParts = createOrderDto.customerName.trim().split(' ');
        const firstName = nameParts[0] || createOrderDto.customerName;
        const lastName = nameParts.slice(1).join(' ') || createOrderDto.customerName;
        
        // Create new user
        const userData: Partial<User> = {
          email: createOrderDto.customerEmail,
          firstName: firstName,
          lastName: lastName,
          isActive: true,
          isEmailVerified: false,
        };
        
        if (createOrderDto.customerPhone) {
          userData.phone = createOrderDto.customerPhone;
        }
        
        user = this.userRepository.create(userData);
        
        user = await this.userRepository.save(user);
        console.log(`Created new user with ID: ${user.id}`);
      } else {
        console.log(`Found existing user with ID: ${user.id}`);
        // Update user info if provided
        if (createOrderDto.customerPhone && !user.phone) {
          user.phone = createOrderDto.customerPhone;
          await this.userRepository.save(user);
        }
      }
      
      // Convert string prices to numbers
      const normalizedItems = createOrderDto.items.map(item => ({
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        quantity: typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity,
        productId: typeof item.productId === 'string' ? parseInt(item.productId, 10) : item.productId,
      }));
      
      // Normalize numeric fields
      const normalizedDto = {
        ...createOrderDto,
        userId: user.id, // Use the found/created user ID
        items: normalizedItems,
        subtotal: typeof createOrderDto.subtotal === 'string' ? parseFloat(createOrderDto.subtotal) : createOrderDto.subtotal,
        tax: typeof createOrderDto.tax === 'string' ? parseFloat(createOrderDto.tax) : createOrderDto.tax,
        shipping: typeof createOrderDto.shipping === 'string' ? parseFloat(createOrderDto.shipping) : createOrderDto.shipping,
        total: typeof createOrderDto.total === 'string' ? parseFloat(createOrderDto.total) : createOrderDto.total,
      };
      
      console.log('Normalized order DTO:', JSON.stringify(normalizedDto, null, 2));
      
      // Generate unique order number
      const orderNumber = this.generateOrderNumber();
      
      // Create order
      const order = this.orderRepository.create({
        orderNumber,
        userId: normalizedDto.userId,
        subtotal: normalizedDto.subtotal,
        tax: normalizedDto.tax,
        shipping: normalizedDto.shipping,
        total: normalizedDto.total,
        shippingAddress: normalizedDto.shippingAddress,
        billingAddress: normalizedDto.billingAddress,
        notes: normalizedDto.notes,
        status: OrderStatus.PENDING,
        paymentStatus: normalizedDto.paymentMethod === 'cash_on_delivery' 
          ? PaymentStatus.PENDING 
          : PaymentStatus.PAID,
      });

      const savedOrder = await this.orderRepository.save(order);
      console.log('Order saved successfully with ID:', savedOrder.id);

      // Create order items
      const orderItems: any[] = [];
      for (const item of normalizedDto.items) {
        console.log(`Processing order item for product ID: ${item.productId}`);
        
        const product = await this.productRepository.findOne({
          where: { id: item.productId }
        });

        if (!product) {
          console.error(`Product with ID ${item.productId} not found`);
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        const itemQuantity = typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity;
        const itemTotal = itemPrice * itemQuantity;

        const orderItem = this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: itemQuantity,
          price: itemPrice,
          total: itemTotal,
        });

        const savedOrderItem = await this.orderItemRepository.save(orderItem);
        console.log(`Order item saved successfully with ID: ${savedOrderItem.id}`);
      
        orderItems.push({
          id: savedOrderItem.id,
          productId: savedOrderItem.productId,
          quantity: savedOrderItem.quantity,
          price: savedOrderItem.price,
          total: savedOrderItem.total,
          product: {
            id: product.id,
            name: product.name,
            image: product.image,
          },
        });
      }

      await this.syncOrderToQuotationTables({
        savedOrder,
        orderItems,
        normalizedDto,
        user,
      });

      console.log('Order creation completed successfully');
      
      const orderResponse = {
        id: savedOrder.id,
        orderNumber: savedOrder.orderNumber,
        userId: savedOrder.userId,
        status: savedOrder.status,
        paymentStatus: savedOrder.paymentStatus,
        subtotal: savedOrder.subtotal,
        tax: savedOrder.tax,
        shipping: savedOrder.shipping,
        total: savedOrder.total,
        shippingAddress: savedOrder.shippingAddress,
        billingAddress: savedOrder.billingAddress,
        notes: savedOrder.notes,
        items: orderItems,
        createdAt: savedOrder.createdAt,
        updatedAt: savedOrder.updatedAt,
      };

      // Send order confirmation email
      console.log('');
      console.log('='.repeat(60));
      console.log('📧 EMAIL SENDING PROCESS START');
      console.log('='.repeat(60));
      console.log('📧 Preparing to send order confirmation email...');
      console.log(`   Order Number: ${savedOrder.orderNumber}`);
      console.log(`   Customer Email from DTO: ${createOrderDto.customerEmail}`);
      console.log(`   Customer Name from DTO: ${createOrderDto.customerName}`);
      console.log(`   Customer Email from normalizedDto: ${normalizedDto.customerEmail}`);
      console.log(`   Customer Name from normalizedDto: ${normalizedDto.customerName}`);
      
      // Use original DTO values if normalizedDto doesn't have them
      const customerEmail = normalizedDto.customerEmail || createOrderDto.customerEmail;
      const customerName = normalizedDto.customerName || createOrderDto.customerName;
      
      console.log(`   Final Customer Email: ${customerEmail}`);
      console.log(`   Final Customer Name: ${customerName}`);
      
      if (!customerEmail || !customerName) {
        console.error('❌ Missing customer email or name. Cannot send email.');
        console.error(`   customerEmail: ${customerEmail || 'MISSING'}`);
        console.error(`   customerName: ${customerName || 'MISSING'}`);
        console.error('='.repeat(60));
        console.log('');
      } else {
        try {
          const emailData = {
            orderNumber: savedOrder.orderNumber,
            customerEmail: customerEmail,
            customerName: customerName,
            items: orderItems.map(item => ({
              productName: item.product.name,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
            subtotal: savedOrder.subtotal,
            tax: savedOrder.tax,
            shipping: savedOrder.shipping,
            total: savedOrder.total,
            shippingAddress: savedOrder.shippingAddress || '',
            paymentMethod: normalizedDto.paymentMethod,
            paymentStatus: savedOrder.paymentStatus,
          };
          
          console.log('📧 Email data prepared:');
          console.log(`   Order Number: ${emailData.orderNumber}`);
          console.log(`   Customer Email: ${emailData.customerEmail}`);
          console.log(`   Customer Name: ${emailData.customerName}`);
          console.log(`   Items Count: ${emailData.items.length}`);
          console.log(`   Total: KES ${emailData.total}`);
          console.log(`   Payment Method: ${emailData.paymentMethod}`);
          console.log(`   Payment Status: ${emailData.paymentStatus}`);
          console.log('');
          
          console.log('📧 Calling emailService.sendOrderConfirmation...');
          await this.emailService.sendOrderConfirmation(emailData);
          console.log('✅ Customer order confirmation email completed');

          const staffNotifyData = {
            ...emailData,
            customerPhone:
              normalizedDto.customerPhone ||
              createOrderDto.customerPhone ||
              undefined,
          };
          console.log('📧 Calling emailService.sendNewOrderStaffNotification...');
          await this.emailService.sendNewOrderStaffNotification(staffNotifyData);
          console.log('✅ Staff new-order notification completed');
          
        } catch (emailError: any) {
          console.error('');
          console.error('❌ EXCEPTION CAUGHT: Failed to send order confirmation email');
          console.error(`   Error Type: ${emailError?.constructor?.name || 'Unknown'}`);
          console.error(`   Error Message: ${emailError?.message || 'Unknown error'}`);
          if (emailError?.response) {
            console.error(`   Response Status: ${emailError.response?.status || 'N/A'}`);
            console.error(`   Response Data:`, JSON.stringify(emailError.response?.data || {}, null, 2));
          }
          if (emailError?.stack) {
            console.error(`   Stack Trace:`, emailError.stack);
          }
          // Don't fail the order creation if email fails
        }
      }
      
      console.log('='.repeat(60));
      console.log('📧 EMAIL SENDING PROCESS END');
      console.log('='.repeat(60));
      console.log('');
      
      return orderResponse;
    } catch (error) {
      console.error('Error in OrdersService.createOrder:', error);
      console.error('Error stack:', error.stack);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  async getOrdersByUserId(userId: number): Promise<OrderResponse[]> {
    const orders = await this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      notes: order.notes,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        product: {
          id: item.product?.id ?? item.productId,
          name: item.product?.name ?? 'Product unavailable',
          image: item.product?.image ?? '',
        },
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  }

  async getOrderById(id: number): Promise<OrderResponse | null> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      return null;
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      notes: order.notes,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        product: {
          id: item.product?.id ?? item.productId,
          name: item.product?.name ?? 'Product unavailable',
          image: item.product?.image ?? '',
        },
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<OrderResponse | null> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      return null;
    }

    order.status = status;
    await this.orderRepository.save(order);

    return this.getOrderById(id);
  }

  async assignRider(id: number, riderId: number): Promise<OrderResponse | null> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      return null;
    }

    const rider = await this.riderRepository.findOne({ where: { id: riderId } });
    if (!rider) {
      throw new Error('Rider not found');
    }

    if (!rider.isActive) {
      throw new Error('Cannot assign inactive rider');
    }

    order.riderId = riderId;
    order.status = OrderStatus.ASSIGNED;
    order.assignedAt = new Date();
    
    await this.orderRepository.save(order);

    return this.getOrderById(id);
  }

  async unassignRider(id: number): Promise<OrderResponse | null> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      return null;
    }

    order.riderId = null;
    order.status = OrderStatus.PENDING;
    order.assignedAt = null;
    
    await this.orderRepository.save(order);

    return this.getOrderById(id);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }

  private getQuotationDbPool(): Pool | null {
    if (this.quotationDbPool) {
      return this.quotationDbPool;
    }

    const host =
      this.configService.get<string>('QUOTATION_DB_HOST') ||
      this.configService.get<string>('DB2_HOST');
    const port =
      Number(this.configService.get<string>('QUOTATION_DB_PORT')) ||
      Number(this.configService.get<string>('DB2_PORT')) ||
      3306;
    const user =
      this.configService.get<string>('QUOTATION_DB_USERNAME') ||
      this.configService.get<string>('DB2_USERNAME');
    const password =
      this.configService.get<string>('QUOTATION_DB_PASSWORD') ||
      this.configService.get<string>('DB2_PASSWORD');
    const database =
      this.configService.get<string>('QUOTATION_DB_DATABASE') ||
      this.configService.get<string>('DB2_DATABASE');

    if (!host || !user || !password || !database) {
      console.warn(
        'Quotation DB env vars are missing. Set QUOTATION_DB_* (or DB2_*) to enable quotation sync.',
      );
      return null;
    }

    this.quotationDbPool = createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      decimalNumbers: true,
    });

    return this.quotationDbPool;
  }

  private async syncOrderToQuotationTables(params: {
    savedOrder: Order;
    orderItems: Array<{
      id: number;
      productId: number;
      quantity: number;
      price: number;
      total: number;
      product: {
        id: number;
        name: string;
        image: string;
      };
    }>;
    normalizedDto: CreateOrderDto & {
      userId: number;
      subtotal: number;
      tax: number;
      shipping: number;
      total: number;
    };
    user: User;
  }): Promise<void> {
    const pool = this.getQuotationDbPool();
    if (!pool) {
      return;
    }

    const { savedOrder, orderItems, normalizedDto, user } = params;
    const connection = await pool.getConnection();
    const now = new Date().toISOString();
    const today = new Date().toISOString().slice(0, 10);
    const taxPercent = Number(normalizedDto.tax) > 0 && Number(normalizedDto.subtotal) > 0
      ? Math.round((Number(normalizedDto.tax) / Number(normalizedDto.subtotal)) * 100)
      : 0;

    try {
      await connection.beginTransaction();

      const [quotationResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO quotation (
          customer_id,
          customer,
          mobile,
          comment,
          comment2,
          address,
          total,
          tax,
          tax_type,
          total_tax,
          total_cost,
          all_total,
          discount,
          percentage_discount,
          discount_amount,
          amount_paid,
          balance,
          staff,
          currency,
          currency_symbol,
          \`date\`,
          status,
          \`view\`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          normalizedDto.customerName,
          normalizedDto.customerPhone || '',
          normalizedDto.notes || '',
          '',
          normalizedDto.shippingAddress || '',
          Number(normalizedDto.subtotal),
          taxPercent,
          'percentage',
          Number(normalizedDto.tax),
          Number(normalizedDto.subtotal),
          Number(normalizedDto.total),
          0,
          0,
          0,
          normalizedDto.paymentMethod === 'cash_on_delivery' ? 0 : Number(normalizedDto.total),
          normalizedDto.paymentMethod === 'cash_on_delivery' ? Number(normalizedDto.total) : 0,
          'Website Checkout',
          'KES',
          'KSh',
          today,
          0,
          0,
        ],
      );

      const quoteId = quotationResult.insertId;
      for (const item of orderItems) {
        const [quotationItemResult] = await connection.execute<ResultSetHeader>(
          `INSERT INTO quotation_items (
            quote_id,
            customer_id,
            sale_status,
            product_id,
            product_name,
            unit_price,
            quantity,
            measure,
            sub_total,
            unit_buying,
            sub_buying,
            details,
            image,
            staff,
            \`date\`
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quoteId,
            user.id,
            0,
            item.productId,
            item.product.name || `Product ${item.productId}`,
            Number(item.price),
            Number(item.quantity),
            'pcs',
            Number(item.total),
            0,
            0,
            normalizedDto.notes || '',
            item.product.image || '',
            'Website Checkout',
            now,
          ],
        );

        const quoteItemId = quotationItemResult.insertId;
        const referenceText = `${item.product.name || `Product ${item.productId}`} x${item.quantity}`;
        await connection.execute(
          `INSERT INTO profoma (
            invoice_id,
            quote_id_items,
            customer_id,
            reference,
            \`date\`,
            tax,
            amount_in,
            amount_out,
            sale_id,
            status,
            staff
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            quoteId,
            quoteItemId,
            user.id,
            referenceText,
            today,
            Number(normalizedDto.tax),
            Number(item.total),
            0,
            savedOrder.id,
            0,
            0,
          ],
        );
      }

      await connection.commit();
      console.log(
        `Quotation sync complete for order ${savedOrder.orderNumber} (quote_id: ${quoteId})`,
      );
    } catch (error: any) {
      await connection.rollback();
      console.error(
        `Quotation sync failed for order ${savedOrder.orderNumber}: ${error?.message || error}`,
      );
    } finally {
      connection.release();
    }
  }
}
