const express = require("express");
const tyreController = require("./../controllers/tyreController");

const router = express.Router();

router.route("/createTyre").post(tyreController.tyreRequest);

module.exports = router;
