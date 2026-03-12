require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createStaffTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'drinks_db',
  });

  try {
    console.log('Creating staff table...');

    // Create staff table
    await connection.execute(`
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
      )
    `);

    console.log('✅ Staff table created successfully');

    // Check if admin user exists
    const [existing] = await connection.execute(
      'SELECT id FROM staff WHERE email = ?',
      ['admin@tassmatt.co.ke']
    );

    if (existing.length === 0) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(
        `INSERT INTO staff (email, firstName, lastName, password, role, isActive) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['admin@tassmatt.co.ke', 'Admin', 'User', hashedPassword, 'admin', true]
      );

      console.log('✅ Default admin user created');
      console.log('   Email: admin@tassmatt.co.ke');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('✅ Staff table setup completed');
  } catch (error) {
    console.error('❌ Error creating staff table:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createStaffTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
