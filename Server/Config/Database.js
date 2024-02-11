const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose
    // .connect(process.env.MONGODB_URL, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // })
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("DB Connection Succesfull");
    })
    .catch((err) => {
      console.log("DB Connection Failed");
      console.log(err);
      process.exit(1);
    });
};
