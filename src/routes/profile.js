const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const User = require('../models/user')

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Cannot validate token, " + error);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if(!validateEditProfileData(req)) {
            throw new Error('Invalid Edit Request');
        }
        const loggedInUser = req.user;

        Object.keys(req.body).every((field) => loggedInUser[field] = req.body[field]);
        await loggedInUser.save()
        res.json({message:`${loggedInUser.firstName} your profile updated successfully!`, data: loggedInUser})
    } catch (err) {
        res.status(400).send("ERROR : "+ err);
    }
});
  

module.exports = profileRouter;
 