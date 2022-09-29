const express = require("express");
const batteryController = require("./../controllers/batteryController");

const router = express.Router();

router.route("/orderBattery").post(batteryController.batteryOrder);
router.route("/dailySales").get(batteryController.dailyBatterySales);
router.route("/customersDaily").get(batteryController.dailyBatteryCustomers);
router.route("/").get(batteryController.getAllBattery);
router.route("/abattery/:id").get(batteryController.getBatteryRequest);
router.route("/update/:id").patch(batteryController.updateBatteryOrder);
router.route("/delete/:id").delete(batteryController.deleteBatteryOrder);

module.exports = router;
