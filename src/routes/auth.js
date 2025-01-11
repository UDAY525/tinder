const express = require('express');
const User = require("../models/user");
const { validateSignUpData, validateLoginData } = require("../utils/validation");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

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
       validateLoginData(req)
      const { emailId, password } = req.body;
      // Encrypt the password
      const userFound = await User.findOne({ emailId });
  
      if (!userFound) {
        throw new Error("No user found");
      }
      const isPassowordValid = await userFound.validatePassword(password);
  
      if (isPassowordValid) {
        const token = await userFound.getJWT();
        res.cookie("token", token, {expires: new Date(Date.now()+8*3600000)});
        res.send("Login Successfull");
      } else {
        throw new Error("Wrong Password");
      }
    } catch (error) {
      res.status(400).send("Cannot Login user, " + error);
    }
  });

authRouter.post('/logout', async (req,res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now())
    }).send('Logout Successfull!!');
})

module.exports = authRouter;