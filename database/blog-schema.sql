-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image VARCHAR(500),
    categoryId INT NOT NULL,
    tags JSON,
    isPublished BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES blog_categories(id) ON DELETE RESTRICT
);

-- Create indexes for better performance
CREATE INDEX idx_blogs_category ON blogs(categoryId);
CREATE INDEX idx_blogs_published ON blogs(isPublished);
CREATE INDEX idx_blogs_created ON blogs(createdAt);
CREATE INDEX idx_blog_categories_active ON blog_categories(isActive);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
