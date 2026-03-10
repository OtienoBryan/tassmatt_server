const mysql = require('mysql2/promise');
require('dotenv').config();

async function addIsPopularColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'impulsep_drinks',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Adding isPopular column to products table...');
    
    // Check if column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'isPopular'
    `, [process.env.DB_NAME || process.env.DB_DATABASE || 'impulsep_drinks']);
    
    if (columns.length > 0) {
      console.log('⚠️  isPopular column already exists');
      return;
    }
    
    // Add the isPopular column
    await connection.execute(`
      ALTER TABLE products 
      ADD COLUMN isPopular BOOLEAN DEFAULT FALSE 
      AFTER isFeatured
    `);
    
    console.log('✅ isPopular column added successfully');
    
    // Create index for better query performance
    try {
      await connection.execute(`
        CREATE INDEX idx_products_popular ON products(isPopular)
      `);
      console.log('✅ Successfully created index on isPopular column');
    } catch (indexError) {
      if (indexError.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Index already exists');
      } else {
        throw indexError;
      }
    }
    
    // Verify the column was added
    const [verify] = await connection.execute(`
      DESCRIBE products
    `);
    
    const isPopularColumn = verify.find(col => col.Field === 'isPopular');
    if (isPopularColumn) {
      console.log('✅ Verified: isPopular column exists');
      console.log('   Column details:', {
        Field: isPopularColumn.Field,
        Type: isPopularColumn.Type,
        Null: isPopularColumn.Null,
        Default: isPopularColumn.Default
      });
    }
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  isPopular column already exists');
    } else {
      console.error('❌ Error adding isPopular column:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

addIsPopularColumn();
