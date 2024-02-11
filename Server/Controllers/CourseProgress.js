const mongoose = require("mongoose");
const Section = require("../Models/Section");
const SubSection = require("../Models/SubSection");
const CourseProgress = require("../Models/CourseProgress");
const Course = require("../Models/Course");
// Update Course Progress Handler Function
exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body;
  const userId = req.user.id;
  try {
    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({ error: "Invalid subsection" });
    }
    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });
    if (!courseProgress) {
      // If course progress doesn't exist Then Create a new one
      return res.status(404).json({
        success: false,
        message: "Course progress Does Not Exist",
      });
    } else {
      // If course progress exists, check if the subsection is already completed
      if (courseProgress.completedVideos.includes(subsectionId)) {
        return res.status(400).json({ error: "Subsection already completed" });
      }
      // Push the subsection into the completedVideos array
      courseProgress.completedVideos.push(subsectionId);
    }
    // Save the updated course progress
    await courseProgress.save();
    // Return Response
    return res.status(200).json({
      success: true,
      message: "Course progress updated",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Cannot Update The Course Progress",
    });
  }
};
// Get Progress Percentage
exports.getProgressPercentage = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;
  if (!courseId) {
    return res.status(400).json({
      error: "Course ID not provided",
    });
  }
  try {
    // Find the course progress document for the user and course
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })
      .populate({
        path: "courseID",
        populate: {
          path: "courseContent",
        },
      })
      .exec();
    if (!courseProgress) {
      return res.status(400).json({
        error: "Can not find Course Progress with these IDs.",
      });
    }
    console.log(courseProgress, userId);
    let lectures = 0;
    courseProgress.courseID.courseContent?.forEach((sec) => {
      lectures += sec.subSection.length || 0;
    });
    let progressPercentage =
      (courseProgress.completedVideos.length / lectures) * 100;
    // To make it up to 2 decimal point
    const multiplier = Math.pow(10, 2);
    progressPercentage =
      Math.round(progressPercentage * multiplier) / multiplier;
    // Return Response
    return res.status(200).json({
      data: progressPercentage,
      message: "Succesfully fetched Course progress",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Cannot get Course Progress %",
    });
  }
};
