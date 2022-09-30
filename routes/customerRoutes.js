const express = require("express");
const customerController = require("./../controllers/customerController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.use(authController.restrictTo(["receptionist", "parkingSectionManager"]));

router.route("/customer").post(customerController.createCustomer);
router.route("/delete/:id").delete(customerController.deleteCustomer);
router.route("/getAll").get(customerController.getAllCustomers);
router.route("/signOff/:id").get(customerController.signOffCustomer);
router
  .route("/signedOffCustomer/:id")
  .patch(customerController.signOffCustomerDB);

router.use(authController.restrictTo(["parkingSectionManager"]));

router.route("/salesDaily").get(customerController.dailyParkingSales);
router.route("/noDaily").get(customerController.noDailyCustomers);

module.exports = router; //Exporting the module
