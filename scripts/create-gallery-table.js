const mysql = require('mysql2/promise');
require('dotenv').config();

async function createGalleryTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_DATABASE || 'drinks_db',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Creating gallery table...');
    
    // Check if table already exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'gallery'
    `, [process.env.DB_DATABASE || 'drinks_db']);
    
    if (tables.length > 0) {
      console.log('⚠️  Gallery table already exists');
      return;
    }
    
    // Create the gallery table
    await connection.execute(`
      CREATE TABLE gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(500) NOT NULL,
        description TEXT,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Gallery table created successfully');
    
    // Verify the table was created
    const [verify] = await connection.execute(`
      DESCRIBE gallery
    `);
    
    console.log('✅ Verified: Gallery table exists');
    console.log('   Columns:', verify.map(col => col.Field).join(', '));
    
  } catch (error) {
    console.error('❌ Error creating gallery table:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

createGalleryTable();
