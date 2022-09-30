const express = require("express");
const tyreController = require("./../controllers/tyreController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.use(authController.restrictTo(["receptionist", "tyreSectionManager"]));

router.route("/createTyre").post(tyreController.tyreRequest);
router.route("/").get(tyreController.getAlltyre);
router.route("/getTyre/:id").get(tyreController.getTyreRequest);
router.route("/updateTyre/:id").patch(tyreController.updateTyreOrder);
router.route("/deleteTyre/:id").delete(tyreController.deleteTyreOrder);

router.use(authController.restrictTo(["tyreSectionManager"]));

router.route("/salesDaily").get(tyreController.dailyTyreSales);
router.route("/customersDaily").get(tyreController.dailyTyreCustomers);

module.exports = router;
