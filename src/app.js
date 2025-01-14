const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData, validateLoginData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json());
app.use(cookieParser());
 

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const requestRouter = require('./routes/requests');
const userRouter = require('./routes/user')

app.use('/',authRouter);
app.use('/',profileRouter);
app.use('/',requestRouter);
app.use('/',userRouter)


// get user by email
app.get("/user", userAuth, async (req, res) => {
  try {
    const found = await User.find({ emailId: req.body.email });
    if (found.length === 0) res.status(404).send("No user found");
    else res.status(200).send(found);
  } catch (err) {
    console.log("Cannot find user,", err);
    res.status(500).send("Cannot find user");
  }
});
app.delete("/user", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.body.userId);
    res.status(200).send("User Deleted");
  } catch (error) {
    res.status(500).send("Cannot delete user");
  }
});
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
    const data = req.body;
    const isUpdatesAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    if (!isUpdatesAllowed) {
      throw new Error("Updates not allowed");
    }
    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });
    console.log(user);
    res.status(200).send("User Updated");
  } catch (error) {
    res.status(500).send("Cannot update user, " + error);
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
      console.log("Server is running...");
    });
  }) 
  .catch((err) => {
    console.error("Database cannot be connected");
  });
