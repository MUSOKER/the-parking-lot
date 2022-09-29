const express = require("express");
const tyreController = require("./../controllers/tyreController");

const router = express.Router();

router.route("/createTyre").post(tyreController.tyreRequest);
router.route("/").get(tyreController.getAlltyre);
router.route("/getTyre/:id").get(tyreController.getTyreRequest);
router.route("/updateTyre/:id").patch(tyreController.updateTyreOrder);
router.route("/deleteTyre/:id").delete(tyreController.deleteTyreOrder);
router.route("/salesDaily").get(tyreController.dailyTyreSales);
router.route("/customersDaily").get(tyreController.dailyTyreCustomers);

module.exports = router;
