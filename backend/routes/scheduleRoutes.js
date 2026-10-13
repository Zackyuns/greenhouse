const express = require("express");
const router = express.Router();

const controller = require("../controllers/scheduleController");

router.get("/", controller.list);
router.get("/next", controller.next);
router.post("/", controller.validateCreate, controller.create);
router.put("/:id", controller.validateUpdate, controller.update);
router.delete("/:id", controller.validateDelete, controller.remove);

module.exports = router;
