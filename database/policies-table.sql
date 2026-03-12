-- Use existing database
USE impulsep_drinks;

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('terms_conditions', 'privacy_policy', 'shipping_policy', 'refund_return', 'cookie_policy', 'disclaimer') NOT NULL,
    content TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_type (type)
);
