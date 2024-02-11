const express = require("express");
const app = express();
require("dotenv").config();

const database = require("./Config/Database");
const PORT = process.env.PORT || 4000;
// DB Connect
database.connect();

const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./Config/Cloudinary");
const fileupload = require("express-fileupload");

const userRoutes = require("./Routes/User");
const profileRoutes = require("./Routes/Profile");
const paymentRoutes = require("./Routes/Payments");
const courseRoutes = require("./Routes/Course");
const contactUsRoute = require("./Routes/Contact");

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);
cloudinaryConnect();

app.use("/api/auth", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reach", contactUsRoute);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running....",
  });
});

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
