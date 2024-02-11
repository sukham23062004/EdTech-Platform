const { contactUsEmail } = require("../mail/contactFormRes");
const mailSender = require("../Utils/mailSender");

// Contact Us Controller
exports.contactUsController = async (req, res) => {
  const { email, firstName, lastName, message, phoneNo, countryCode } =
    req.body;
  console.log(req.body);
  try {
    const emailRes = await mailSender(
      email,
      "Your Data send successfully",
      contactUsEmail(email, firstName, lastName, message, phoneNo, countryCode)
    );
    console.log("Email Response", emailRes);
    return res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (err) {
    console.log(err.message);
    return res.json({
      success: false,
      message: "Something went wrong...",
    });
  }
};
