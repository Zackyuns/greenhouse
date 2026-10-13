
# GREENHOUSE-IOT — Semua Fitur

## Arsitektur
Frontend → Backend Express → TiDB Cloud
ESP32 → Backend Express → TiDB Cloud

## Fitur
- Dashboard sensor realtime
- Grafik sensor
- Monitoring suhu, kelembapan, dan cahaya
- Kontrol penyiraman manual
- Jadwal penyiraman CRUD
- Riwayat penyiraman
- API untuk ESP32
- TiDB Cloud sebagai database

## Menjalankan Backend

```bash
cd backend
npm install
```

Buat file `.env` dari `.env.example`, kemudian isi kredensial TiDB Cloud.

```bash
npm run dev
```

Backend:
`http://localhost:3000`

## Menjalankan Frontend

Buka `frontend/index.html` dengan Live Server.

## Catatan
Database harus sudah memiliki tabel:
- sensor_logs
- watering_schedules
- watering_logs
- system_status

ESP32 mengirim:
POST /api/sensors

Format:
```json
{
  "temperature": 26.9,
  "humidity": 54.4,
  "light_intensity": 71.67
}
```

## Deploy ke Vercel

Ikuti panduan `DEPLOY-VERCEL.md`. Frontend dan backend dibuat sebagai dua project Vercel terpisah dari repository yang sama. Jangan unggah file `.env`.
