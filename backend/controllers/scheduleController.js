const db = require("../config/database");
const { body, param, validationResult } = require("express-validator");

// Helper untuk format waktu HH:MM atau HH:MM:SS
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

exports.validateCreate = [
    body("schedule_time")
        .matches(timeRegex)
        .withMessage("Format schedule_time tidak valid (gunakan HH:MM atau HH:MM:SS)"),
    body("duration_seconds")
        .isInt({ min: 1, max: 3600 })
        .withMessage("Duration seconds harus berupa angka bulat antara 1 dan 3600")
];

exports.validateUpdate = [
    param("id")
        .isInt()
        .withMessage("ID jadwal harus berupa angka"),
    body("schedule_time")
        .optional()
        .matches(timeRegex)
        .withMessage("Format schedule_time tidak valid (gunakan HH:MM atau HH:MM:SS)"),
    body("duration_seconds")
        .optional()
        .isInt({ min: 1, max: 3600 })
        .withMessage("Duration seconds harus berupa angka bulat antara 1 dan 3600"),
    body("is_active")
        .optional()
        .isBoolean()
        .withMessage("is_active harus bertipe boolean")
];

exports.validateDelete = [
    param("id")
        .isInt()
        .withMessage("ID jadwal harus berupa angka")
];

exports.list = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, schedule_time, duration_seconds, is_active,
                    created_at, updated_at
             FROM watering_schedules
             ORDER BY schedule_time ASC`
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

exports.next = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `SELECT id, schedule_time, duration_seconds, is_active
             FROM watering_schedules
             WHERE is_active = TRUE
             ORDER BY schedule_time ASC
             LIMIT 1`
        );

        res.json({
            success: true,
            data: rows[0] || null
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validasi gagal",
                errors: errors.array()
            });
        }

        const {
            schedule_time,
            duration_seconds
        } = req.body;

        const [result] = await db.execute(
            `INSERT INTO watering_schedules
                (schedule_time, duration_seconds, is_active)
             VALUES (?, ?, TRUE)`,
            [
                schedule_time,
                Number(duration_seconds)
            ]
        );

        res.status(201).json({
            success: true,
            message: "Jadwal berhasil dibuat",
            data: {
                id: result.insertId,
                schedule_time,
                duration_seconds: Number(duration_seconds),
                is_active: true
            }
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.update = async (req, res, next) => {
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
        const {
            schedule_time,
            duration_seconds,
            is_active
        } = req.body;

        // Construct update query
        const sets = [];
        const params = [];

        if (schedule_time !== undefined) {
            sets.push("schedule_time = ?");
            params.push(schedule_time);
        }
        if (duration_seconds !== undefined) {
            sets.push("duration_seconds = ?");
            params.push(Number(duration_seconds));
        }
        if (is_active !== undefined) {
            sets.push("is_active = ?");
            params.push(is_active === true || is_active === "true" || is_active === 1);
        }

        if (sets.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Tidak ada data yang diubah"
            });
        }

        params.push(id);

        const [result] = await db.execute(
            `UPDATE watering_schedules
             SET ${sets.join(", ")},
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            params
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Jadwal tidak ditemukan"
            });
        }

        res.json({
            success: true,
            message: "Jadwal berhasil diperbarui"
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.remove = async (req, res, next) => {
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
            `DELETE FROM watering_schedules WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Jadwal tidak ditemukan"
            });
        }

        res.json({
            success: true,
            message: "Jadwal berhasil dihapus"
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
