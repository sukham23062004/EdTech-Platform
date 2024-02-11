const express = require("express");
const router = express.Router();
const { auth } = require("../Middlewares/auth");

const {
  sendOTP,
  signUp,
  login,
  changePassword,
} = require("../Controllers/Auth");
const {
  resetPasswordToken,
  resetPassword,
} = require("../Controllers/ResetPassword");

router.post("/login", login);
router.post("/signup", signUp);
router.post("/sendotp", sendOTP);
router.post("/changepassword", auth, changePassword);
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

module.exports = router;
