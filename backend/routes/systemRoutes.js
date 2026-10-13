
const express = require("express");
const router = express.Router();

const controller = require("../controllers/systemController");

router.get("/status", controller.status);

module.exports = router;
