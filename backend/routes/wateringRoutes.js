const express = require("express");
const router = express.Router();

const controller = require("../controllers/wateringController");

router.get("/status", controller.status);
router.get("/command", controller.command);
router.post("/start", controller.start);
router.post("/stop", controller.stop);
router.post("/auto-start", controller.autoStart);
router.post("/auto-stop", controller.autoStop);
router.get("/logs", controller.logs);

// Hapus riwayat (dengan validation)
router.delete("/logs/:id", controller.validateDeleteLog, controller.deleteLog);
router.delete("/logs", controller.validateDeleteMultiple, controller.deleteMultipleLogs);

module.exports = router;
