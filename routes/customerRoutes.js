const express = require("express");
const customerController = require("./../controllers/customerController");

const router = express.Router();

router.route("/customer").post(customerController.createCustomer);
router.route("/delete/:id").delete(customerController.deleteCustomer);
router.route("/getAll").get(customerController.getAllCustomers);

module.exports = router; //Exporting the module
