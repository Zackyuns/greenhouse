require("dotenv").config();

// Gunakan zona waktu Indonesia untuk parsing dan pencatatan waktu.
process.env.TZ = process.env.TZ || "Asia/Jakarta";

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Pada Vercel, rahasia dan kredensial wajib diatur melalui Project Settings > Environment Variables.
if (process.env.VERCEL === "1") {
    const requiredVars = [
        "TIDB_HOST",
        "TIDB_USER",
        "TIDB_PASSWORD",
        "TIDB_DATABASE",
        "JWT_SECRET"
    ];
    const missingVars = requiredVars.filter((name) => !process.env[name]);
    if (missingVars.length) {
        throw new Error(`Environment variable belum diatur di Vercel: ${missingVars.join(", ")}`);
    }
}

const sensorRoutes = require("./routes/sensorRoutes");
const wateringRoutes = require("./routes/wateringRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const systemRoutes = require("./routes/systemRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Frontend dan backend dideploy sebagai dua project Vercel yang berbeda.
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({ success: true, message: "Greenhouse IoT API aktif" });
});

app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "Backend dapat diakses" });
});

app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/watering", wateringRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/system", systemRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

app.use((err, req, res, next) => {
    console.error("Centralized Error Handler:", err.stack || err.message || err);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Terjadi kesalahan internal pada server"
    });
});

module.exports = app;
