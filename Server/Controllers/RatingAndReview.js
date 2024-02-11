const Course = require("../Models/Course");
const RatingAndReview = require("../Models/RatingAndReview");
const { mongo, default: mongoose } = require("mongoose");
// Create RatingAndReview
exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, review, courseId } = req.body;
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: {
        $elemMatch: {
          $eq: userId,
        },
      },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student Not Enrolled in the Course",
      });
    }
    // If User already reviewed the course Then we will not allow to review again
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Student Reviewed Already",
      });
    }
    // Creating Rating and Review
    const ratingReview = await RatingAndReview.create({
      rating: rating,
      course: courseId,
      user: userId,
    });
    // Updating the course with new Ratings
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);
    return res.status(200).json({
      success: true,
      message: "Rating and Review Done Successfully",
      ratingReview,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// Getting Average Ratings for Course
exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }
    // If No rating found Then
    return res.status(200).json({
      success: true,
      message: "Average Rating is 0",
      averageRating: 0,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// Get All Ratings
exports.getAllRating = async (req, res) => {
  try {
    const allRating = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec(); // Populating only specific Things inside the Model
    return res.status(200).json({
      success: true,
      message: "All Ratings fetched Successfully",
      data: allRating,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
