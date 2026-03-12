# Staff Authentication Setup Guide

This guide explains how to set up database-backed authentication for the admin panel.

## Overview

The admin login system has been updated to use a `staff` table in the database instead of hardcoded credentials. Staff members can have different roles: `admin`, `manager`, or `staff`.

## Database Setup

### 1. Create the Staff Table

Run the setup script to create the staff table and default admin user:

```bash
cd backend
npm run db:create-staff
```

Or manually run:
```bash
node scripts/create-staff-table.js
```

This will:
- Create the `staff` table if it doesn't exist
- Create a default admin user:
  - Email: `admin@tassmatt.co.ke`
  - Password: `admin123`
  - Role: `admin`

### 2. Manual SQL Setup (Alternative)

If you prefer to run SQL manually:

```sql
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
```

Then create an admin user (password will be hashed automatically by the entity):

```sql
-- Note: Use the script to create users as passwords are hashed with bcrypt
-- Or use: npm run db:create-staff
```

## API Endpoints

### Login
- **POST** `/api/auth/admin/login`
- **Body**: `{ "email": "admin@tassmatt.co.ke", "password": "admin123" }`
- **Response**: 
  ```json
  {
    "token": "base64_encoded_token",
    "staff": {
      "id": 1,
      "email": "admin@tassmatt.co.ke",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin"
    }
  }
  ```

### Get Current User
- **GET** `/api/auth/admin/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Staff user object

## Frontend Changes

The admin frontend has been updated to:
1. Call the real API endpoint `/api/auth/admin/login`
2. Store the authentication token in localStorage
3. Validate tokens on page load
4. Handle authentication errors properly

## Creating New Staff Members

### Via Script (Recommended)

Create a script to add staff members:

```javascript
// scripts/add-staff.js
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function addStaff() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const hashedPassword = await bcrypt.hash('your_password', 10);
  
  await connection.execute(
    `INSERT INTO staff (email, firstName, lastName, password, role, isActive) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['staff@example.com', 'John', 'Doe', hashedPassword, 'staff', true]
  );

  await connection.end();
}
```

### Via API (Future Enhancement)

You can add an endpoint to create staff members through the admin panel.

## Security Notes

1. **Password Hashing**: Passwords are automatically hashed using bcrypt before storing in the database
2. **Token Generation**: Currently using simple base64 tokens. Consider upgrading to JWT for production
3. **Role-Based Access**: Staff roles can be used to control access to different admin features
4. **Account Status**: Staff accounts can be deactivated by setting `isActive = false`

## Default Credentials

After running the setup script:
- **Email**: `admin@tassmatt.co.ke`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password after first login in production!

## Troubleshooting

### Login Fails
1. Check that the staff table exists: `SHOW TABLES LIKE 'staff';`
2. Verify admin user exists: `SELECT * FROM staff WHERE email = 'admin@tassmatt.co.ke';`
3. Check backend logs for authentication errors
4. Verify bcrypt is installed: `npm list bcrypt`

### Token Validation Fails
1. Check that the token is being sent in the Authorization header
2. Verify the token format matches what the backend expects
3. Check backend logs for token validation errors

### Database Connection Issues
1. Verify database credentials in `.env` file
2. Test database connection: `npm run db:test`
3. Check that the database exists and is accessible
