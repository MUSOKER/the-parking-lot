const express = require("express");
const customerController = require("./../controllers/customerController");

const router = express.Router();

router.route("/customer").post(customerController.createCustomer);
router.route("/delete/:id").delete(customerController.deleteCustomer);
router.route("/getAll").get(customerController.getAllCustomers);
router.route("/salesDaily").get(customerController.dailyParkingSales);
router.route("/noDaily").get(customerController.noDailyCustomers);
router.route("/signOff/:id").get(customerController.signOffCustomer);
router
  .route("/signedOffCustomer/:id")
  .patch(customerController.signOffCustomerDB);

module.exports = router; //Exporting the module
