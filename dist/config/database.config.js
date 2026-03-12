"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const entities_1 = require("../entities");
const blog_category_entity_1 = require("../entities/blog-category.entity");
const blog_entity_1 = require("../entities/blog.entity");
const gallery_entity_1 = require("../entities/gallery.entity");
const policy_entity_1 = require("../entities/policy.entity");
const staff_entity_1 = require("../entities/staff.entity");
const getDatabaseConfig = (configService) => ({
    type: 'mysql',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [entities_1.Category, entities_1.Product, entities_1.User, entities_1.Cart, entities_1.CartItem, entities_1.Order, entities_1.OrderItem, entities_1.Rider, entities_1.SubCategory, entities_1.Brand, blog_category_entity_1.BlogCategory, blog_entity_1.Blog, gallery_entity_1.Gallery, policy_entity_1.Policy, staff_entity_1.Staff],
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'development',
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false,
});
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map