const express = require("express");
const { contactUsController } = require("../Controllers/ContactUs");
const router = express.Router();

router.post("/contact", contactUsController);
module.exports = router;
