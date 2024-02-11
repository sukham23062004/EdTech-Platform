const User = require("../Models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
// Auth Middleware
exports.auth = async (req, res, next) => {
  try {
    // Extracting the Token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");
    // If Token is missing Then return response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token Missing",
      });
    }
    // Verification of Token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token Is Invalid",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Issues in Auth Middleware",
    });
  }
};
// isStudent Middleware
exports.isStudent = async (req, res, next) => {
  try {
    /* This can also be done
    const userDetails = await User.findOne({ email: req.user.email });
    if (userDetails.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		} 
    */
    console.log(req.user.accountType);
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "Protected Route for Students only",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "User Role cannot be verified",
    });
  }
};
// isInstructor Middleware
exports.isInstructor = async (req, res, next) => {
  try {
    console.log(req.user.accountType);
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "Protected Route for Instructors only",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "User Role cannot be verified",
    });
  }
};
// isAdmin Middleware
exports.isAdmin = async (req, res, next) => {
  try {
    console.log(req.user.accountType);
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "Protected Route for Admin only",
      });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "User Role cannot be verified",
    });
  }
};
