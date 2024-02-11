const express = require("express");
const router = express.Router();
const { auth, isInstructor } = require("../Middlewares/auth");

const {
  updateProfile,
  deleteAccount,
  getAllDetailsOfUser,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} = require("../Controllers/Profile");

router.delete("/deleteProfile", auth, deleteAccount);
router.put("/updateProfile", auth, updateProfile);
router.get("/getUserDetails", auth, getAllDetailsOfUser);
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard);

module.exports = router;
