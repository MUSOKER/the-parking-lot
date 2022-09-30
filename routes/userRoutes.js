const express = require("express");
//const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();
//Do not forget to use protect to the protected routes  router.use(authController.protect); ie routes to be performed when only you are logged in
//and router.use(authController.restrictTo('admin'));
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.patch("/resetPassword/:token", authController.resetPassword);
router.post("/forgotPassword", authController.forgotPassword);

router.use(authController.protect); //must be a logged user
router.patch("/verifyAccount/:token", authController.verifyAccount);
router.patch("/updateMyPassword", authController.updatePassword);
router.post(
  "/updateUserRole",
  authController.restrictTo([
    "batterySectionManager",
    "parkingSectionManager",
    "tyreSectionManager",
  ]),
  authController.updateUserRole
);

module.exports = router; //Exporting the module
