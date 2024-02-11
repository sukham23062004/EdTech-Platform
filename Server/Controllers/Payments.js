// This file is Yet to Update
const mongoose = require("mongoose");
const { instance } = require("../Config/Razorpay");
const Course = require("../Models/Course");
const crypto = require("crypto");
const User = require("../Models/User");
const mailSender = require("../Utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/paymentSuccessfulEmail");
const CourseProgress = require("../Models/CourseProgress");
// Capture The payment and init the razorpay order
exports.capturePayment = async (req, res) => {
  try {
    const { course_id } = req.body;
    const userId = req.user.id;
    if (!course_id) {
      return res.json({
        success: false,
        message: "Course ID is invalid",
      });
    }
    // Valid Course Detail
    let course;
    try {
      course = await Course.findById(course_id);
      if (!course) {
        return res.json({
          success: false,
          message: "Could Not Find Course",
        });
      }
      const uid = new mongoose.Types.ObjectId(userId); // Converting the userId String into a object type uid
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(200).json({
          success: false,
          message: "Student Already Enrolled",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
    // Create Order
    const amount = course.price;
    const currency = "INR";
    const options = {
      amount: amount * 100,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId: course_id,
        userId,
      },
    };
    // Init the Payment
    try {
      const paymentResponse = await instance.orders.create(options);
      console.log(paymentResponse);
      return res.status(200).json({
        success: true,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: "Unable to Process Payment",
        error: err.message,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Unable to Capture Payment",
      error: err.message,
    });
  }
};
// Authorisation of Payment or Verification of the Signature
exports.verifySignature = async (req, res) => {
  const webHookSecret = process.env.WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"]; // This comes from the razorpay in encrypted format & hashed format
  // SHA - Standard Hashing Algo
  const shasum = crypto.createHmac("sha256", webHookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");
  if (signature === digest) {
    console.log("Payment is Successfully Authorised");
    // Now you have to Put the CourseId inside the Courses Array of the User and UserId inside the User Array of the Course , You get these id through the notes That you have sent during the order Creation
    const { courseId, userId } = req.body.payload.payment.entity.notes;
    try {
      // Find the course and enroll The student
      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseId },
        {
          $push: {
            studentsEnrolled: userId,
          },
        },
        { new: true }
      );
      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Unable to Enroll The student",
        });
      }
      console.log(enrolledCourse);
      // Find the Student and Add the course
      const enrolledStudent = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );
      if (!enrolledStudent) {
        return res.status(500).json({
          success: false,
          message: "Unable to Enroll The Course To Student",
        });
      }
      console.log(enrolledStudent);
      // Confirmation Mail Sender
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations",
        "You are enrolled for the Course"
      );
      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "Signature Verified and Actions executed",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid Request",
    });
  }
};
// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;
  const userId = req.user.id;
  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide All Payment details",
    });
  }
  try {
    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (err) {
    console.log("Error Occured while sending Payment Success Email", err);
    return res.status(500).json({
      success: false,
      message: "Could not send email",
    });
  }
};
