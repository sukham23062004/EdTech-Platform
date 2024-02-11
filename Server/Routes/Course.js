const express = require("express");
const router = express.Router();
// Importing all the controllers
const {
  createCourse,
  editCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  getInstructorCourses,
  deleteCourse,
} = require("../Controllers/Course");
const {
  createCategory,
  showAllCategories,
  categoryPageDetails,
} = require("../Controllers/Category");
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../Controllers/Section");
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../Controllers/SubSection");
const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../Controllers/RatingAndReview");
const { updateCourseProgress } = require("../Controllers/CourseProgress");
// Importing Middlewares
const {
  auth,
  isStudent,
  isInstructor,
  isAdmin,
} = require("../Middlewares/auth");

router.post("/createCourse", auth, isInstructor, createCourse);
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);
router.post("/addSubSection", auth, isInstructor, createSubSection);
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
router.get("/getAllCourses", getAllCourses);
router.post("/getCourseDetails", getCourseDetails);
router.post("/getFullCourseDetails", auth, getFullCourseDetails);
router.post("/editCourse", auth, isInstructor, editCourse);
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses);
router.delete("/deleteCourse", deleteCourse);
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;
