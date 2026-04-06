-- Run against MySQL if GET /api/admin/products returns 500 and server logs show
-- "Unknown column", "doesn't exist", or missing table errors.
-- TypeORM synchronize is false; schema must match backend/src/entities/*.entity.ts

-- 1) Multi-category join table (required for Product.categories relation)
CREATE TABLE IF NOT EXISTS product_categories (
    productId INT NOT NULL,
    categoryId INT NOT NULL,
    PRIMARY KEY (productId, categoryId),
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
);

-- 2) Backfill primary category into the join table (safe to re-run)
INSERT IGNORE INTO product_categories (productId, categoryId)
SELECT id, categoryId FROM products WHERE categoryId IS NOT NULL;

-- 3) Add missing columns only if your products table lacks them (run one at a time;
--    skip any line that errors with "Duplicate column"):
-- ALTER TABLE products ADD COLUMN isPopular BOOLEAN DEFAULT FALSE;
-- ALTER TABLE products ADD COLUMN brandId INT NULL;
-- ALTER TABLE products ADD COLUMN subcategoryId INT NULL;

-- For isPopular specifically you can also run: node backend/scripts/add-isPopular-column.js
