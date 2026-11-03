const express = require("express");
const controller = require("../controllers/reservasController");

const router = express.Router();

// /stats va ANTES de /:id, o Express interpretaria "stats" como un identificador
router.get("/stats", controller.getStats);

router.get("/", controller.listReservas);
router.get("/:id", controller.getReserva);
router.post("/", controller.createReserva);
router.put("/:id", controller.replaceReserva);
router.patch("/:id", controller.patchReserva);
router.delete("/:id", controller.deleteReserva);

module.exports = router;