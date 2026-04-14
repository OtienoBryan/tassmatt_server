-- Run once on existing databases (TypeORM synchronize is off).
ALTER TABLE orders
  ADD COLUMN paymentMethod VARCHAR(64) NULL AFTER paymentStatus,
  ADD COLUMN mpesaCheckoutRequestId VARCHAR(128) NULL AFTER paymentMethod,
  ADD COLUMN mpesaReceiptNumber VARCHAR(64) NULL AFTER mpesaCheckoutRequestId;
