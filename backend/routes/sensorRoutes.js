const express = require("express");
const router = express.Router();

const controller = require("../controllers/sensorController");

router.post("/", controller.validateCreate, controller.create);
router.get("/latest", controller.latest);
router.get("/history", controller.history);

module.exports = router;
