const express = require("express");
const User = require("../models/user");
const {
  validateSignUpData,
  validateLoginData,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const session = require("express-session");
const validator = require("validator");

const authRouter = express.Router();
// authRouter.use(bodyParser.json());

// Configure session to store OTP temporarily
authRouter.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 5 * 60 * 1000 }, // 5 minutes expiration
  })
);

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "udaybikkinauday54359@gmail.com", // Replace with your email
    pass: "gxyjbrqacyxpzdkk", // Replace with your email password or app-specific password
  },
});

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);
    const { firstName, lastName, emailId, password } = req.body;
    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    console.log(req.body);
    res.send("User Added Successfully");
  } catch (error) {
    res.status(500).send("Cannot signup user, " + error);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    // Validation of data
    validateLoginData(req);
    const { emailId, password } = req.body;
    // Encrypt the password
    const userFound = await User.findOne({ emailId });

    if (!userFound) {
      throw new Error("No user found");
    }
    const isPassowordValid = await userFound.validatePassword(password);

    if (isPassowordValid) {
      const token = await userFound.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send("Login Successfull");
    } else {
      throw new Error("Wrong Password");
    }
  } catch (error) {
    res.status(400).send("Cannot Login user, " + error);
  }
});

authRouter.post("/logout", async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logout Successfull!!");
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const userEmail = req.body.emailId;
    const otp = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit OTP

    // Store the OTP in session
    req.session.otp = otp;
    req.session.email = userEmail;

    // Configure the email message
    const mailOptions = {
      from: "udaybikkinauday54359@gmail.com", // Sender email
      to: userEmail, // Recipient email
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 5 minutes.`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error sending email:", error);
    res
      .status(500)
      .json({ message: "Error sending OTP. Please try again later." });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  const { password, otp } = req.body;

  if (!req.session.otp || !req.session.email) {
    return res
      .status(400)
      .json({
        message: "No OTP request found. Please initiate forgot password again.",
      });
  }

  if (parseInt(otp, 10) !== req.session.otp) {
    return res.status(400).json({ message: "Invalid OTP. Please try again." });
  }

  if (!password || password.length < 4) {
    return res
      .status(400)
      .json({ message: "Password must be at least 4 characters long." });
  }

  try {
    const user = await User.findOne({ emailId: req.session.email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!validator.isStrongPassword(password)) {
      throw new Error("Please enter a strong password!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    req.session.otp = null;
    req.session.email = null;

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({
        message:
          "An error occurred while resetting the password. Please try again later."+error,
      });
  }
});

module.exports = authRouter;
