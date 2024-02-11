const { Mongoose } = require("mongoose");
const Category = require("../Models/Category");
const match = require("nodemon/lib/monitor/match");
const { status } = require("express/lib/response");
const { populate } = require("../Models/User");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Create Category ka handler Function
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // Entry Creation in DB
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(categoryDetails);
    return res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// Getting All Categories
exports.showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    ); // Making Sure that we get Those tags only which have non null name and desc. fields in Them
    console.log(allCategories);
    return res.status(200).json({
      success: true,
      message: "All Categories successfully fetched",
      allCategories,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
// Category Page Details
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;
    console.log("Category Id Is", categoryId);
    // Get all courses for specified Category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: {
          status: "Published",
        },
        populate: "ratingAndReviews",
      })
      .exec();
    console.log(selectedCategory);
    if (!selectedCategory) {
      console.log("Category Not found");
      return res.status(404).json({
        success: false,
        message: "Category Not Found",
      });
    }
    // Handling when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses for selected Category");
      return res.status(404).json({
        success: false,
        message: "No courses for selected Category",
      });
    }
    // Adding Functionality of getting Other courses If selected course is NULL and also add Top courses features In It , Count how many times a course is being sold and return The populated methods in a sorted order
    // Get courses for other Category
    const categoriesExceptSelected = await Category.find({
      _id: {
        $ne: categoryId, // Get all courses whose id is not equal to Selected Category ID
      },
    });
    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec();
    console.log("Diffrent Category", differentCategory);
    // Get Top Selling Course Among All Category
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);
    console.log("Most Selling Course", mostSellingCourses);
    return res.status(200).json({
      success: true,
      selectedCategory,
      differentCategory,
      mostSellingCourses,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
