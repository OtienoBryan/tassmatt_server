import { Repository } from 'typeorm';
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
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private productRepository;
    private userRepository;
    private riderRepository;
    private emailService;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, productRepository: Repository<Product>, userRepository: Repository<User>, riderRepository: Repository<Rider>, emailService: EmailService);
    createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponse>;
    getOrdersByUserId(userId: number): Promise<OrderResponse[]>;
    getOrderById(id: number): Promise<OrderResponse | null>;
    updateOrderStatus(id: number, status: OrderStatus): Promise<OrderResponse | null>;
    assignRider(id: number, riderId: number): Promise<OrderResponse | null>;
    unassignRider(id: number): Promise<OrderResponse | null>;
    private generateOrderNumber;
}
