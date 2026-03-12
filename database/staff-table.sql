-- Create staff table for admin authentication
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    lastLoginAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt with salt rounds 10
INSERT INTO staff (email, firstName, lastName, password, role, isActive) 
VALUES (
    'admin@tassmatt.co.ke',
    'Admin',
    'User',
    '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
    'admin',
    TRUE
) ON DUPLICATE KEY UPDATE email=email;

-- Note: The password hash above is a placeholder. 
-- In production, use bcrypt to hash passwords properly.
-- To create a proper hash, use: bcrypt.hash('admin123', 10)
