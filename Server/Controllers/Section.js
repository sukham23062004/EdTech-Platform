const Course = require("../Models/Course");
const Section = require("../Models/Section");
const SubSection = require("../Models/SubSection");
exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }
    const newSection = await Section.create({ sectionName });
    // Update The course with new created Section
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { courseContent: newSection._id },
      },
      { new: true }
    )
      .populate({
        // Use populate to replace subsections and sections both in the updatedCourseDetails
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "Section Created Successully",
      updatedCourseDetails,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Unable to Create Section",
      error: err.message,
    });
  }
};
// Update The Section
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body;
    if (!sectionName || !sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName,
      },
      { new: true }
    );
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "Section Updated Successully",
      data: {
        updatedSection,
        course,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Unable to Update Section",
      error: err.message,
    });
  }
};
// Delete Section Handler
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.params; // Getting the id to be deleted from the Params of the body
    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "SectionId Cannot be Null",
      });
    }
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });
    const section = await Section.findById(sectionId);
    console.log(sectionId, courseId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not Found",
      });
    }
    await SubSection.deleteMany({ _id: { $in: section.subSection } });
    await Section.findByIdAndDelete(sectionId);
    // Get the updated course and return it
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: "Section Deleted Successully",
      data: course,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Unable to Delete Section",
      error: err.message,
    });
  }
};
