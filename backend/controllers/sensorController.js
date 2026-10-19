const db = require("../config/database");
const { body, validationResult } = require("express-validator");

// Middleware validasi untuk create sensor
exports.validateCreate = [
    body("temperature")
        .isFloat({ min: -50, max: 100 })
        .withMessage("Temperature harus antara -50 dan 100"),
    body("humidity")
        .isFloat({ min: 0, max: 100 })
        .withMessage("Humidity harus antara 0 dan 100"),
    body("light_intensity")
        .isFloat({ min: 0, max: 100000 })
        .withMessage("Light intensity harus antara 0 dan 100000")
];

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
            temperature,
            humidity,
            light_intensity
        } = req.body;

        const [result] = await db.execute(
            `INSERT INTO sensor_logs
                (temperature, humidity, light_intensity)
             VALUES (?, ?, ?)`,
            [
                Number(temperature),
                Number(humidity),
                Number(light_intensity)
            ]
        );

        await db.execute(
            `
            UPDATE system_status
            SET
                device_status = 'online',
                last_updated = ?
            WHERE id = (
                SELECT id
                FROM (
                    SELECT id
                    FROM system_status
                    ORDER BY id DESC
                    LIMIT 1
                ) AS latest
            )
            `,
            [new Date()]
        );

        res.status(201).json({
            success: true,
            message: "Data sensor berhasil disimpan",
            data: {
                id: result.insertId,
                temperature: Number(temperature),
                humidity: Number(humidity),
                light_intensity: Number(light_intensity)
            }
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.latest = async (req, res, next) => {
    try {
        const [rows] = await db.execute(
            `
            SELECT
                id,
                temperature,
                humidity,
                light_intensity,
                DATE_FORMAT(
                    created_at,
                    '%Y-%m-%dT%H:%i:%sZ'
                ) AS created_at
            FROM sensor_logs
            ORDER BY created_at DESC
            LIMIT 1
            `
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

exports.history = async (req, res, next) => {
    try {
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 100, 1),
            500
        );

        const [rows] = await db.query(
            `
            SELECT
                id,
                temperature,
                humidity,
                light_intensity,
                DATE_FORMAT(
                    created_at,
                    '%Y-%m-%dT%H:%i:%sZ'
                ) AS created_at
            FROM sensor_logs
            ORDER BY created_at DESC
            LIMIT ${limit}
            `
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
