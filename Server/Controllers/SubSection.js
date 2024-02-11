const { updateMany } = require("../Models/OTP");
const Section = require("../Models/Section");
const SubSection = require("../Models/SubSection");
const { uploadImageToCloudinary } = require("../Utils/imageUploader");

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, timeDuration = "", description } = req.body;
    const video = req.files.videoFile;
    if (!sectionId || !title || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    // Creating a SubSection
    const SubSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    // Updating The section with The sub Section id
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $push: {
          subSection: SubSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection");
    // Console Log The updated Section after populating the Sub Section
    return res.status(200).json({
      success: true,
      message: "Sub Section Created Successully",
      updatedSection,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Unable to Create Sub Section",
      error: err.message,
    });
  }
};
exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId, title, description } = req.body;
    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }
    if (title !== undefined) {
      subSection.title = title;
    }
    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }
    await subSection.save();
    // Find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );
    console.log("Updated Section", updatedSection);
    return res.json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );
    return res.json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedSection,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
