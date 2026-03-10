"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const product_entity_1 = require("../entities/product.entity");
const user_entity_1 = require("../entities/user.entity");
const rider_entity_1 = require("../entities/rider.entity");
let OrdersService = class OrdersService {
    orderRepository;
    orderItemRepository;
    productRepository;
    userRepository;
    riderRepository;
    constructor(orderRepository, orderItemRepository, productRepository, userRepository, riderRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.riderRepository = riderRepository;
    }
    async createOrder(createOrderDto) {
        console.log('Creating order with DTO:', JSON.stringify(createOrderDto, null, 2));
        if (!createOrderDto.items || !Array.isArray(createOrderDto.items)) {
            console.error('Invalid items array:', createOrderDto.items);
            throw new Error('Items must be an array');
        }
        const orderNumber = this.generateOrderNumber();
        const order = this.orderRepository.create({
            orderNumber,
            userId: createOrderDto.userId,
            subtotal: createOrderDto.subtotal,
            tax: createOrderDto.tax,
            shipping: createOrderDto.shipping,
            total: createOrderDto.total,
            shippingAddress: createOrderDto.shippingAddress,
            billingAddress: createOrderDto.billingAddress,
            notes: createOrderDto.notes,
            status: order_entity_1.OrderStatus.PENDING,
            paymentStatus: createOrderDto.paymentMethod === 'cash_on_delivery'
                ? order_entity_1.PaymentStatus.PENDING
                : order_entity_1.PaymentStatus.PAID,
        });
        const savedOrder = await this.orderRepository.save(order);
        const orderItems = [];
        for (const item of createOrderDto.items) {
            const product = await this.productRepository.findOne({
                where: { id: item.productId }
            });
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            const orderItem = this.orderItemRepository.create({
                orderId: savedOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
            });
            const savedOrderItem = await this.orderItemRepository.save(orderItem);
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
        return {
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
    }
    async getOrdersByUserId(userId) {
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
                    id: item.product.id,
                    name: item.product.name,
                    image: item.product.image,
                },
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        }));
    }
    async getOrderById(id) {
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
                    id: item.product.id,
                    name: item.product.name,
                    image: item.product.image,
                },
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }
    async updateOrderStatus(id, status) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            return null;
        }
        order.status = status;
        await this.orderRepository.save(order);
        return this.getOrderById(id);
    }
    async assignRider(id, riderId) {
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
        order.status = order_entity_1.OrderStatus.ASSIGNED;
        order.assignedAt = new Date();
        await this.orderRepository.save(order);
        return this.getOrderById(id);
    }
    async unassignRider(id) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            return null;
        }
        order.riderId = null;
        order.status = order_entity_1.OrderStatus.PENDING;
        order.assignedAt = null;
        await this.orderRepository.save(order);
        return this.getOrderById(id);
    }
    generateOrderNumber() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${timestamp.slice(-6)}-${random}`;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(rider_entity_1.Rider)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map