const db = require("../config/database");

// Status koneksi ditentukan dari data sensor terbaru yang benar-benar
// masuk dari ESP32. Jangan memakai system_status.last_updated sebagai
// heartbeat karena perintah relay/penyiraman juga dapat mengubah kolom itu.
const DEVICE_TIMEOUT_SECONDS = 30;

exports.status = async (req, res, next) => {
    try {
        const [sensorResult, systemResult] = await Promise.all([
            db.execute(
                `SELECT
                    created_at,
                    TIMESTAMPDIFF(SECOND, created_at, CURRENT_TIMESTAMP) AS age_seconds
                 FROM sensor_logs
                 ORDER BY created_at DESC
                 LIMIT 1`
            ),
            db.execute(
                `SELECT relay_status
                 FROM system_status
                 ORDER BY id DESC
                 LIMIT 1`
            )
        ]);

        const sensorRow = sensorResult?.[0]?.[0] || null;
        const systemRow = systemResult?.[0]?.[0] || null;

        const ageSeconds = sensorRow?.age_seconds == null
            ? null
            : Number(sensorRow.age_seconds);

        // ESP32 dianggap terhubung hanya jika pembacaan sensor terbaru
        // masuk dalam 30 detik terakhir. Jika belum ada data, status offline.
        const connected = ageSeconds !== null
            && Number.isFinite(ageSeconds)
            && ageSeconds >= 0
            && ageSeconds <= DEVICE_TIMEOUT_SECONDS;

        res.json({
            success: true,
            data: {
                connected,
                deviceStatus: connected ? "online" : "offline",
                lastUpdated: sensorRow?.created_at || null,
                relayStatus: Boolean(systemRow?.relay_status),
                ageSeconds
            }
        });
    } catch (error) {
        console.error("System status error:", error);
        next(error);
    }
};
