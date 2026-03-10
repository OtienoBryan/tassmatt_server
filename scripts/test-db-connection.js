const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testDatabaseConnection() {
  console.log('🔍 Database Connection Test');
  console.log('='.repeat(50));
  console.log('');

  // Display configuration (mask password)
  console.log('📋 Configuration from .env:');
  console.log(`   Host: ${process.env.DB_HOST || 'NOT SET'}`);
  console.log(`   Port: ${process.env.DB_PORT || '3306'}`);
  console.log(`   Username: ${process.env.DB_USERNAME || 'NOT SET'}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-2) : 'NOT SET'}`);
  console.log(`   Database: ${process.env.DB_DATABASE || 'NOT SET'}`);
  console.log('');

  // Validate required fields
  const requiredFields = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE'];
  const missingFields = requiredFields.filter(field => !process.env[field]);
  
  if (missingFields.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingFields.forEach(field => console.log(`   - ${field}`));
    console.log('');
    console.log('💡 Create or update backend/.env file with these variables.');
    process.exit(1);
  }

  // Test connection
  console.log('🧪 Testing connection...');
  console.log('');

  try {
    // Step 1: Test basic connection
    console.log('Step 1: Connecting to MySQL server...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      connectTimeout: 10000, // 10 second timeout
    });

    console.log('   ✅ Successfully connected to MySQL server!');
    console.log('');

    // Step 2: Get MySQL version and server info
    console.log('Step 2: Getting server information...');
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log(`   ✅ MySQL Version: ${version[0].version}`);
    
    const [currentUser] = await connection.execute('SELECT USER() as user, @@hostname as hostname');
    console.log(`   ✅ Connected as: ${currentUser[0].user}`);
    console.log(`   ✅ Server hostname: ${currentUser[0].hostname}`);
    console.log('');

    // Step 3: Check if database exists
    console.log('Step 3: Checking if database exists...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbName = process.env.DB_DATABASE;
    const dbExists = databases.some(db => db.Database === dbName);
    
    if (dbExists) {
      console.log(`   ✅ Database '${dbName}' exists!`);
      console.log('');

      // Step 4: Connect to specific database
      console.log('Step 4: Connecting to database...');
      await connection.execute(`USE ${dbName}`);
      console.log(`   ✅ Successfully connected to '${dbName}'`);
      console.log('');

      // Step 5: Check tables
      console.log('Step 5: Checking tables...');
      const [tables] = await connection.execute('SHOW TABLES');
      
      if (tables.length > 0) {
        console.log(`   ✅ Found ${tables.length} table(s):`);
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log(`      - ${tableName}`);
        });
        console.log('');

        // Step 6: Test sample queries
        console.log('Step 6: Testing sample queries...');
        const commonTables = ['categories', 'products', 'users', 'orders', 'riders', 'brands'];
        
        for (const tableName of commonTables) {
          try {
            const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`   ✅ ${tableName}: ${result[0].count} record(s)`);
          } catch (err) {
            // Table doesn't exist, skip
          }
        }
        console.log('');

      } else {
        console.log('   ⚠️  No tables found. Database is empty.');
        console.log('   💡 Run: npm run db:setup');
        console.log('');
      }

    } else {
      console.log(`   ❌ Database '${dbName}' does not exist!`);
      console.log('');
      console.log('   Available databases:');
      databases.forEach(db => {
        console.log(`      - ${db.Database}`);
      });
      console.log('');
      console.log('   💡 Create the database or update DB_DATABASE in .env');
    }

    await connection.end();
    console.log('');
    console.log('='.repeat(50));
    console.log('✅ All tests passed! Database connection is working.');
    console.log('='.repeat(50));
    process.exit(0);

  } catch (error) {
    console.log('   ❌ Connection failed!');
    console.log('');
    console.log('='.repeat(50));
    console.log('🔧 Error Details:');
    console.log('='.repeat(50));
    console.log(`   Error Code: ${error.code || 'UNKNOWN'}`);
    console.log(`   Error Message: ${error.message}`);
    console.log('');

    // Detailed troubleshooting based on error type
    console.log('='.repeat(50));
    console.log('💡 Troubleshooting Guide:');
    console.log('='.repeat(50));
    console.log('');

    switch (error.code) {
      case 'ER_ACCESS_DENIED_ERROR':
        console.log('❌ Access Denied Error');
        console.log('');
        console.log('This usually means:');
        console.log('   1. Wrong username or password');
        console.log('   2. User does not have permission to connect from your IP address');
        console.log('   3. User account is locked or disabled');
        console.log('');
        console.log('Solutions:');
        console.log('   • Double-check username and password in backend/.env');
        console.log('   • Verify the user exists: SELECT user, host FROM mysql.user;');
        console.log('   • Check if your IP is whitelisted (for remote databases)');
        console.log('   • For cPanel/hosting: Check MySQL Remote Access settings');
        console.log('   • Try connecting with MySQL Workbench or phpMyAdmin');
        console.log('');
        if (error.message.includes('@')) {
          const match = error.message.match(/user '([^']+)'@'([^']+)'/);
          if (match) {
            console.log(`   Detected: User '${match[1]}' trying to connect from '${match[2]}'`);
            console.log(`   💡 Make sure this IP is allowed in MySQL user privileges`);
          }
        }
        break;

      case 'ECONNREFUSED':
        console.log('❌ Connection Refused');
        console.log('');
        console.log('MySQL server is not accepting connections.');
        console.log('');
        console.log('Solutions:');
        console.log('   • Check if MySQL server is running');
        console.log('   • Verify the host and port are correct');
        console.log('   • Check firewall settings');
        console.log('   • For remote servers: Ensure remote access is enabled');
        break;

      case 'ENOTFOUND':
        console.log('❌ Host Not Found');
        console.log('');
        console.log('Cannot resolve the hostname.');
        console.log('');
        console.log('Solutions:');
        console.log('   • Check if hostname/IP is correct');
        console.log('   • Verify DNS resolution');
        console.log('   • Try using IP address instead of hostname');
        break;

      case 'ETIMEDOUT':
        console.log('❌ Connection Timeout');
        console.log('');
        console.log('Server did not respond in time.');
        console.log('');
        console.log('Solutions:');
        console.log('   • Check if MySQL is running on the specified port');
        console.log('   • Verify firewall allows connections');
        console.log('   • Check network connectivity');
        console.log('   • For remote servers: Ensure port is open');
        break;

      case 'ER_BAD_DB_ERROR':
        console.log('❌ Database Does Not Exist');
        console.log('');
        console.log('The specified database was not found.');
        console.log('');
        console.log('Solutions:');
        console.log('   • Create the database');
        console.log('   • Check DB_DATABASE name in .env');
        console.log('   • Run: npm run db:setup');
        break;

      default:
        console.log(`❌ Unexpected Error: ${error.code || 'UNKNOWN'}`);
        console.log('');
        console.log('Error details:');
        console.log(`   ${error.message}`);
        if (error.sqlState) {
          console.log(`   SQL State: ${error.sqlState}`);
        }
        console.log('');
        console.log('General solutions:');
        console.log('   • Verify all credentials in backend/.env');
        console.log('   • Check MySQL server logs');
        console.log('   • Test connection with MySQL client');
    }

    console.log('');
    console.log('='.repeat(50));
    console.log('📝 Next Steps:');
    console.log('='.repeat(50));
    console.log('1. Fix the issue above');
    console.log('2. Run this test again: npm run db:test');
    console.log('3. Once connected, run: npm run db:setup');
    console.log('');
    
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
