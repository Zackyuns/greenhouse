# Setup Halaman Login Greenhouse IoT

Halaman login telah berhasil dibuat dengan sistem autentikasi lengkap!

## Status Setup

✅ **SUDAH SELESAI:**
- Tabel `users` sudah dibuat di TiDB Cloud
- User admin default sudah dibuat (username: `admin`, password: `admin123`)
- Dependencies `bcrypt` dan `jsonwebtoken` sudah terinstall
- Backend server sudah diupdate dengan endpoint autentikasi
- Semua halaman frontend sudah dilindungi dengan autentikasi

## Fitur Login
- ✅ Form login dengan username & password
- ✅ Checkbox "Ingat saya" untuk menyimpan session lebih lama
- ✅ Validasi input client-side
- ✅ Error handling & pesan error yang user-friendly
- ✅ Loading state saat proses login
- ✅ Desain konsisten dengan tema Greenhouse IoT
- ✅ Responsive untuk mobile & desktop
- ✅ Autentikasi JWT (JSON Web Token)
- ✅ Password hashing dengan bcrypt
- ✅ Auto-redirect ke dashboard setelah login berhasil
- ✅ Auto-redirect ke login jika user belum login
- ✅ Token verification dengan backend

## File yang Dibuat

### Frontend
1. `frontend/login.html` - Halaman login
2. `frontend/css/login.css` - Styling halaman login
3. `frontend/js/login.js` - Logic autentikasi frontend
4. `frontend/js/auth.js` - Helper functions untuk autentikasi (token management, redirect, dll)

### Backend
1. `backend/controllers/authController.js` - Controller untuk login, verify token, change password, get profile
2. `backend/routes/authRoutes.js` - Routes untuk endpoint autentikasi
3. `backend/middleware/authMiddleware.js` - Middleware untuk protect routes
4. `backend/setup-auth.js` - Script untuk setup database users
5. `backend/server.js` - Updated dengan auth routes

### Database
1. `database/create_users_table.sql` - SQL script untuk membuat tabel users (manual reference)

### File yang Diupdate
- `backend/package.json` - Menambahkan bcrypt dan jsonwebtoken dependencies
- `frontend/index.html` - Menambahkan script auth.js
- `frontend/monitoring.html` - Menambahkan script auth.js
- `frontend/penyiraman.html` - Menambahkan script auth.js
- `frontend/jadwal.html` - Menambahkan script auth.js
- `frontend/riwayat.html` - Menambahkan script auth.js

## Cara Setup

### 1. Install Dependencies Baru
```bash
cd backend
npm install bcrypt jsonwebtoken
```

### 2. Setup Database Users Table
```bash
npm run setup-auth
```
atau
```bash
node setup-auth.js
```

Script ini akan:
- Membuat tabel `users` di TiDB Cloud
- Membuat user admin default dengan kredensial:
  - **Username:** `admin`
  - **Password:** `admin123`

⚠️ **PENTING:** Ganti password admin setelah login pertama kali!

### 3. Tambahkan Environment Variable (Optional)
Tambahkan ke file `.env`:
```env
JWT_SECRET=greenhouse-iot-secret-key-2024
```

Jika tidak ditambahkan, akan menggunakan default secret key.

### 4. Restart Backend Server
```bash
npm run dev
```

### 5. Test Login
1. Buka `frontend/login.html` di browser (dengan Live Server)
2. Login dengan kredensial default:
   - Username: `admin`
   - Password: `admin123`
3. Setelah berhasil login, akan redirect ke dashboard (`index.html`)

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - Login user

### Protected Endpoints (Memerlukan Token)
- `GET /api/auth/verify` - Verify token validity
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password

## Cara Protect Routes Lain

Untuk melindungi endpoint lain dengan autentikasi, tambahkan middleware `authMiddleware`:

```javascript
const authMiddleware = require('./middleware/authMiddleware');

// Contoh protect route
app.get('/api/watering', authMiddleware, wateringController.getAllWatering);
```

## Struktur Database Table Users

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);
```

## Token Storage

- **Remember Me checked:** Token disimpan di `localStorage` (persistent)
- **Remember Me unchecked:** Token disimpan di `sessionStorage` (hilang saat browser ditutup)

## Next Steps

1. Protect semua routes yang memerlukan autentikasi
2. Tambahkan halaman ganti password
3. Tambahkan halaman manage users (untuk admin)
4. Tambahkan fitur logout
5. Tambahkan middleware untuk cek apakah user sudah login di halaman dashboard
