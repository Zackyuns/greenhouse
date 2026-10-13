const db = require("../config/database");
const { body, param, validationResult } = require("express-validator");

async function addLog(type, duration, status, startedAt, finishedAt) {
    await db.execute(
        `INSERT INTO watering_logs
            (watering_type, duration_seconds, status, started_at, finished_at)
         VALUES (?, ?, ?, ?, ?)`,
        [type, duration, status, startedAt, finishedAt]
    );
}

// Validation middleware
exports.validateDeleteLog = [
    param("id")
        .isInt()
        .withMessage("ID riwayat harus berupa angka")
];

exports.validateDeleteMultiple = [
    body("ids")
        .isArray({ min: 1 })
        .withMessage("ids harus berupa array yang tidak kosong"),
    body("ids.*")
        .isInt()
        .withMessage("Semua ID harus berupa angka")
];

exports.command = async (req, res, next) => {
    try {
        const [rows] = await db.execute(`
            SELECT relay_status
            FROM system_status
            ORDER BY id DESC
            LIMIT 1
        `);

        const relayStatus = Boolean(
            rows[0]?.relay_status
        );

        res.json({
            success: true,
            relay: relayStatus ? "ON" : "OFF"
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.status = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT relay_status, device_status, last_updated
             FROM system_status
             ORDER BY id DESC
             LIMIT 1`
        );

        const row = rows[0];

        res.json({
            success: true,
            data: {
                isOn: Boolean(row?.relay_status),
                deviceStatus: row?.device_status || "offline",
                lastUpdated: row?.last_updated || null
            }
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.start = async (req, res, next) => {
    try {
        const startedAt = new Date();

        await db.execute(
            `UPDATE system_status
             SET relay_status = TRUE,
                 last_updated = CURRENT_TIMESTAMP
             WHERE id = (
                 SELECT id FROM (
                     SELECT id
                     FROM system_status
                     ORDER BY id DESC
                     LIMIT 1
                 ) AS latest
             )`
        );

        await addLog(
            "manual",
            0,
            "active",
            startedAt,
            null
        );

        res.json({
            success: true,
            message: "Penyiraman dimulai",
            data: {
                isOn: true
            }
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.stop = async (req, res, next) => {
    try {
        const finishedAt = new Date();

        await db.execute(
            `UPDATE system_status
             SET relay_status = FALSE,
                 last_updated = CURRENT_TIMESTAMP
             WHERE id = (
                 SELECT id FROM (
                     SELECT id
                     FROM system_status
                     ORDER BY id DESC
                     LIMIT 1
                 ) AS latest
             )`
        );

        await db.execute(
            `UPDATE watering_logs
             SET status = 'completed',
                 finished_at = ?,
                 duration_seconds =
                    CASE
                        WHEN started_at IS NOT NULL
                        THEN TIMESTAMPDIFF(SECOND, started_at, ?)
                        ELSE duration_seconds
                    END
             WHERE status = 'active'
             ORDER BY id DESC
             LIMIT 1`,
            [finishedAt, finishedAt]
        );

        res.json({
            success: true,
            message: "Penyiraman dihentikan",
            data: {
                isOn: false
            }
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.logs = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, watering_type, duration_seconds, status,
                    started_at, finished_at
             FROM watering_logs
             ORDER BY started_at DESC
             LIMIT 100`
        );

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.deleteLog = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validasi gagal",
                errors: errors.array()
            });
        }

        const id = Number(req.params.id);

        const [result] = await db.execute(
            `DELETE FROM watering_logs WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Riwayat tidak ditemukan"
            });
        }

        res.json({
            success: true,
            message: "Riwayat berhasil dihapus"
        });

    } catch (error) {
        console.error("Gagal menghapus riwayat:", error);
        next(error);
    }
};

exports.deleteMultipleLogs = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validasi gagal",
                errors: errors.array()
            });
        }

        const { ids } = req.body;

        const cleanIds = ids.map(Number).filter(Number.isInteger);

        if (cleanIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tidak ada ID valid untuk dihapus"
            });
        }

        const placeholders = cleanIds.map(() => "?").join(",");

        const [result] = await db.execute(
            `DELETE FROM watering_logs WHERE id IN (${placeholders})`,
            cleanIds
        );

        res.json({
            success: true,
            message: `${result.affectedRows} riwayat berhasil dihapus`,
            deleted: result.affectedRows
        });

    } catch (error) {
        console.error("Gagal menghapus banyak riwayat:", error);
        next(error);
    }
};

// =====================================================
// MULAI PENYIRAMAN OTOMATIS / JADWAL
// =====================================================

exports.autoStart = async (req, res, next) => {
    try {
        const { duration } = req.body;

        const startedAt = new Date();

        await addLog(
            "schedule",
            Number(duration) || 0,
            "active",
            startedAt,
            null
        );

        res.json({
            success: true,
            message:
                "Log penyiraman jadwal berhasil dibuat"
        });

    } catch (error) {
        console.error(
            "Gagal mencatat penyiraman jadwal:",
            error
        );

        next(error);
    }
};


// =====================================================
// SELESAIKAN PENYIRAMAN OTOMATIS / JADWAL
// =====================================================

exports.autoStop = async (req, res, next) => {
    try {
        const finishedAt = new Date();

        await db.execute(
            `
            UPDATE watering_logs
            SET
                status = 'completed',
                finished_at = ?,
                duration_seconds =
                    CASE
                        WHEN started_at IS NOT NULL
                        THEN TIMESTAMPDIFF(
                            SECOND,
                            started_at,
                            ?
                        )
                        ELSE duration_seconds
                    END
            WHERE watering_type = 'schedule'
              AND status = 'active'
            ORDER BY id DESC
            LIMIT 1
            `,
            [
                finishedAt,
                finishedAt
            ]
        );

        res.json({
            success: true,
            message:
                "Log penyiraman jadwal selesai"
        });

    } catch (error) {
        console.error(
            "Gagal menyelesaikan penyiraman jadwal:",
            error
        );

        next(error);
    }
};