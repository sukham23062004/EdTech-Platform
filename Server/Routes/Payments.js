const express = require("express");
const router = express.Router();

const { auth, isStudent } = require("../Middlewares/auth");
const {
  capturePayment,
  verifySignature,
  sendPaymentSuccessEmail,
} = require("../Controllers/Payments");

router.post("/capturePayment", auth, isStudent, capturePayment);
router.post("/verifyPayment", auth, isStudent, verifySignature);
router.post(
  "/sendPaymentSuccessEmail",
  auth,
  isStudent,
  sendPaymentSuccessEmail
);

module.exports = router;
