const otpGenerator = require("otp-generator");
const OTP = require("../Models/OTP");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const Profile = require("../Models/Profile");
const jwt = require("jsonwebtoken");
const mailSender = require("../Utils/mailSender");
const { passwordUpdated } = require("../mail/passwordUpdate");
require("dotenv").config();

// Sending OTP Controller
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body; // Extracting email from the body of the Request made
    const checkUserPresent = await User.findOne({ email }); // Check if user already exists or not
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User Already Exists",
      });
    }
    // Generating The OTP
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP Generated", otp);
    // Checking if The Generated OTP is unique or not
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { email, otp };
    // Creating an entry in the DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);
    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp,
    });
  } catch (err) {
    console.log("Error occurred in senOTP Function", err);
    res.status(500).json({
      success: false,
      message: "OTP Not Sent",
    });
  }
};
// Sign Up Controller
exports.signUp = async (req, res) => {
  try {
    // Data extraction from req kii body by destructuring
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All Fields are required",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password Doesn't matched with Confirm Password",
      });
    }
    // Checking if user already exists in DB
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }
    // Finding The most recent OTP
    const recentOTP = await OTP.find({ email })
      .sort({
        createdAt: -1,
      })
      .limit(1);
    console.log("Latest OTP is", recentOTP);
    // OTP not found
    if (recentOTP.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found Length Equals 0",
      });
    } else if (otp !== recentOTP[0].otp) {
      return res.status(400).json({
        success: false,
        message: "OTP Doesnot Matched",
      });
    }
    // Hashing The password
    const hashedPassword = await bcrypt.hash(password, 10);
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);
    const ProfileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: ProfileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    return res.status(200).json({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "User Not Registered , Try Again",
    });
  }
};
// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User Not Registered , Signup first",
      });
    }
    // JWT Generation after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "12h",
      });
      user.token = token;
      user.password = undefined;
      // Creating Cookie and sending response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged In Successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password Incorrect",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Login Failed , Try Again",
    });
  }
};
// Change Password -
exports.changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);
    const { oldPassword, newPassword } = req.body;
    // Validate Old Password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "The password is incorrect",
      });
    }
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );
    // Send Notification Email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (err) {
      console.error("Error occurred while sending email", err);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
