const express = require("express");
const batteryController = require("./../controllers/batteryController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.use(authController.protect);
router.use(
  authController.restrictTo(["receptionist", "batterySectionManager"])
);
router.route("/orderBattery").post(batteryController.batteryOrder);
router.route("/").get(batteryController.getAllBattery);
router.route("/abattery/:id").get(batteryController.getBatteryRequest);
router.route("/update/:id").patch(batteryController.updateBatteryOrder);
router.route("/delete/:id").delete(batteryController.deleteBatteryOrder);

router.use(authController.restrictTo(["batterySectionManager"]));
router.route("/dailySales").get(batteryController.dailyBatterySales);
router.route("/customersDaily").get(batteryController.dailyBatteryCustomers);
module.exports = router;
