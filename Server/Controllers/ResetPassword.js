const User = require("../Models/User");
const mailSender = require("../Utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
// Reset Password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "Email Not Registered",
      });
    }
    // Generating Token
    const token = crypto.randomUUID();
    // const token = crypto.randomBytes(20).toString("hex");
    // Update The user by adding Token and expiresIn Time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    // Creating The url
    const url = `http://localhost:3000/update-password/${token}`;
    // Sending Email with password
    await mailSender(email, "Password Reset Link", `${url}`);
    return res.json({
      success: true,
      message: "Password Reset Link Sent Successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Password Reset Link Issue Occurred",
    });
  }
};
// Reset Password Logic
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body; // Token will be Passed as a parameter by the body and body will get the Token from the url we hit
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password Not matching",
      });
    }
    // Get User Details by the help of Token
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token Invalid",
      });
    }
    // Token Time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "Token Expired , Generate The link again",
      });
    }
    // Hashing The password
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Password Reset Successfull",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong Password not reset",
    });
  }
};
