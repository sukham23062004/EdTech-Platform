const mongoose = require("mongoose");
const mailSender = require("../Utils/mailSender");
const { otpTemplate } = require("../mail/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});
// Function to Send Verification Email
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email Sended by ft. Sukham Singh",
      otpTemplate(otp)
    );
    console.log("Email Sent Successfully", mailResponse);
  } catch (err) {
    console.log("Error Occurred In sendVerificationEmail", err.message);
    throw err;
  }
}
OTPSchema.pre("save", async function (next) {
  // Just before Saving and Going to next middleware make sure To have a OTP Call function
  console.log("Saving The Document");
  await sendVerificationEmail(this.email, this.otp);
  next(); // Going to next Middleware
});
module.exports = mongoose.model("OTP", OTPSchema);
