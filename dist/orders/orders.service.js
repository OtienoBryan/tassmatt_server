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
const email_service_1 = require("../email/email.service");
let OrdersService = class OrdersService {
    orderRepository;
    orderItemRepository;
    productRepository;
    userRepository;
    riderRepository;
    emailService;
    constructor(orderRepository, orderItemRepository, productRepository, userRepository, riderRepository, emailService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.riderRepository = riderRepository;
        this.emailService = emailService;
    }
    async createOrder(createOrderDto) {
        console.log('Creating order with DTO:', JSON.stringify(createOrderDto, null, 2));
        try {
            if (!createOrderDto.items || !Array.isArray(createOrderDto.items)) {
                console.error('Invalid items array:', createOrderDto.items);
                throw new Error('Items must be an array');
            }
            if (!createOrderDto.customerEmail || !createOrderDto.customerName) {
                throw new Error('Customer email and name are required');
            }
            let user = await this.userRepository.findOne({
                where: { email: createOrderDto.customerEmail }
            });
            if (!user) {
                console.log(`User not found with email ${createOrderDto.customerEmail}, creating new user`);
                const nameParts = createOrderDto.customerName.trim().split(' ');
                const firstName = nameParts[0] || createOrderDto.customerName;
                const lastName = nameParts.slice(1).join(' ') || createOrderDto.customerName;
                const userData = {
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
            }
            else {
                console.log(`Found existing user with ID: ${user.id}`);
                if (createOrderDto.customerPhone && !user.phone) {
                    user.phone = createOrderDto.customerPhone;
                    await this.userRepository.save(user);
                }
            }
            const normalizedItems = createOrderDto.items.map(item => ({
                ...item,
                price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
                quantity: typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity,
                productId: typeof item.productId === 'string' ? parseInt(item.productId, 10) : item.productId,
            }));
            const normalizedDto = {
                ...createOrderDto,
                userId: user.id,
                items: normalizedItems,
                subtotal: typeof createOrderDto.subtotal === 'string' ? parseFloat(createOrderDto.subtotal) : createOrderDto.subtotal,
                tax: typeof createOrderDto.tax === 'string' ? parseFloat(createOrderDto.tax) : createOrderDto.tax,
                shipping: typeof createOrderDto.shipping === 'string' ? parseFloat(createOrderDto.shipping) : createOrderDto.shipping,
                total: typeof createOrderDto.total === 'string' ? parseFloat(createOrderDto.total) : createOrderDto.total,
            };
            console.log('Normalized order DTO:', JSON.stringify(normalizedDto, null, 2));
            const orderNumber = this.generateOrderNumber();
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
                status: order_entity_1.OrderStatus.PENDING,
                paymentStatus: normalizedDto.paymentMethod === 'cash_on_delivery'
                    ? order_entity_1.PaymentStatus.PENDING
                    : order_entity_1.PaymentStatus.PAID,
            });
            const savedOrder = await this.orderRepository.save(order);
            console.log('Order saved successfully with ID:', savedOrder.id);
            const orderItems = [];
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
            }
            else {
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
                    console.log('✅ Email service call completed');
                }
                catch (emailError) {
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
                }
            }
            console.log('='.repeat(60));
            console.log('📧 EMAIL SENDING PROCESS END');
            console.log('='.repeat(60));
            console.log('');
            return orderResponse;
        }
        catch (error) {
            console.error('Error in OrdersService.createOrder:', error);
            console.error('Error stack:', error.stack);
            console.error('Error message:', error.message);
            throw error;
        }
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
        typeorm_2.Repository,
        email_service_1.EmailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map