# Deploy Greenhouse IoT ke Vercel tanpa Render

Proyek ini dideploy sebagai **dua project Vercel** yang menggunakan repository GitHub yang sama:

1. **Backend** — root directory `backend`, Express + TiDB Cloud.
2. **Frontend** — root directory `frontend`, halaman HTML/CSS/JS statis.

## Sebelum mulai: keamanan

- Jangan commit file `backend/.env`. File tersebut sengaja tidak disertakan di paket ini.
- Jika `backend/.env` pernah masuk ke repository GitHub yang sudah Public, anggap nilai di dalamnya telah terekspos. Hapus `backend/.env` dari working folder/repository lalu commit penghapusan; menambahkan `.gitignore` saja tidak menghapus file yang sudah terlacak Git. Ganti/reset password TiDB Cloud dan buat `JWT_SECRET` baru yang panjang dan acak. Menghapus file di commit terbaru tidak menghapusnya dari riwayat Git lama, jadi rotasi kredensial tetap wajib.
- Jangan gunakan password admin default. `setup-auth.js` sekarang membaca `ADMIN_PASSWORD` dari environment.

## A. Deploy backend lebih dulu

1. Upload/commit isi paket ini ke repository GitHub.
2. Di Vercel, pilih **Add New → Project**, lalu import repository tersebut.
3. Pada **Root Directory**, pilih `backend`. Framework harus terdeteksi sebagai **Express** (konfigurasi `backend/vercel.json` sudah disediakan).
4. Hubungkan project. Jika diminta build/start command, gunakan pengaturan default Vercel untuk Express. Untuk menjalankan lokal tetap gunakan `npm start`.
5. Buka **Project Settings → Environment Variables** dan tambahkan variabel berikut untuk Production (tambahkan untuk Preview juga bila akan digunakan di Preview):

   - `TIDB_HOST` — host dari TiDB Cloud
   - `TIDB_PORT` — biasanya `4000` untuk TiDB Cloud
   - `TIDB_USER` — username TiDB Cloud
   - `TIDB_PASSWORD` — password TiDB Cloud
   - `TIDB_DATABASE` — nama database, misalnya `db_greenhouse_iot`
   - `JWT_SECRET` — string rahasia panjang dan acak; jangan gunakan contoh/default yang mudah ditebak

   Ambil nilai koneksi dari pengaturan TiDB Cloud milikmu. Jangan menaruhnya di kode atau membagikannya di chat. Pastikan koneksi database mengharuskan TLS/SSL.

6. Deploy backend. Setelah berhasil, buka URL deployment backend lalu tambahkan `/api/test`. Contoh: `https://nama-backend.vercel.app/api/test`. Hasil yang diharapkan adalah JSON dengan `success: true` dan pesan `Backend dapat diakses`. Jika gagal, lihat **Runtime Logs** Vercel dan periksa environment variables.

## B. Sambungkan frontend ke backend

1. Di repository, buka `frontend/js/config.js`.
2. Ganti baris `DEPLOYED_BACKEND_URL` dengan URL backend Vercel hasil langkah A, tanpa `/api` di bagian akhir. Contoh:

   ```js
   const DEPLOYED_BACKEND_URL = "https://nama-backend.vercel.app";
   ```

3. Commit dan push perubahan ke GitHub.
4. Buat project Vercel kedua dari repository yang sama. Pilih **Root Directory** `frontend` dan **Framework Preset: Other** untuk HTML statis. Tidak perlu build command; gunakan output directory default/root sesuai tampilan Vercel.
5. Deploy, lalu uji dashboard, monitoring, penyiraman, jadwal, login, dan riwayat.

Frontend tetap menggunakan `http://localhost:3000/api` ketika dibuka lokal dari `localhost`/`127.0.0.1`.

## C. ESP32

Firmware ESP32 harus mengirim request ke URL backend Vercel, bukan `localhost` atau alamat laptop. Format endpoint sensor adalah `POST https://nama-backend.vercel.app/api/sensors`. Firmware ESP32 tidak termasuk di ZIP ini, jadi URL di firmware perlu diubah pada proyek Arduino/ESP32 yang kamu pakai.

## D. Catatan perilaku serverless

- API dijalankan sebagai Vercel Function dan dapat mengalami cold start.
- Jangan mengandalkan data yang hanya disimpan di variabel global/memori antar-request. Gunakan TiDB Cloud sebagai sumber data persisten.
- Vercel Free/Hobby memiliki batas penggunaan; periksa batas terbaru pada dashboard/dokumentasi Vercel.
- Pastikan jadwal otomatis yang dijalankan ESP32 tetap diproses oleh firmware. Vercel tidak menjalankan proses Node.js yang hidup terus-menerus seperti server lokal.
