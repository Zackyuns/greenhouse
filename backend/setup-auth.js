require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/database');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_FULL_NAME = process.env.ADMIN_FULL_NAME || 'Administrator';

if (!ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD wajib diatur di backend/.env sebelum menjalankan setup-auth.');
  process.exit(1);
}

async function setupUsersTable() {
  try {
    console.log('🔄 Membuat tabel users...');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Tabel users berhasil dibuat');

    // Check if admin user already exists
    const [existingAdmin] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [ADMIN_USERNAME]
    );

    if (existingAdmin.length === 0) {
      console.log('🔄 Membuat user admin default...');

      // Hash password yang disediakan melalui environment variable
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

      // Insert admin user
      await db.query(
        `INSERT INTO users (username, password_hash, full_name, role, is_active)
         VALUES (?, ?, ?, ?, ?)`,
        [ADMIN_USERNAME, passwordHash, ADMIN_FULL_NAME, 'admin', 1]
      );

      console.log('✅ User admin berhasil dibuat');
      console.log('');
      console.log('=================================');
      console.log('   KREDENSIAL LOGIN DEFAULT');
      console.log('=================================');
      console.log(`Username: ${ADMIN_USERNAME}`);
      console.log('Password tidak dicetak. Simpan dengan aman.');
      console.log('=================================');
      console.log('⚠️  PENTING: Segera ganti password setelah login pertama!');
      console.log('');
    } else {
      console.log('ℹ️  User admin sudah ada, skip membuat user baru');
    }

    console.log('✅ Setup database selesai');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setup database:', error);
    process.exit(1);
  }
}

setupUsersTable();
