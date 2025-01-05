const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData, validateLoginData } = require('./utils/validation')
const bcrypt = require('bcrypt')


app.use(express.json());
app.post("/signup", async (req, res) => {
   
    try {
         // Validation of data
        validateSignUpData(req)
        const {firstName, lastName, emailId, password} = req.body;
        // Encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);
        
        const user = new User({firstName, lastName, emailId, password:passwordHash});
        await user.save(); 
        console.log(req.body);
        res.send("User Added Successfully");
    } catch (error) {
        res.status(500).send("Cannot signup user, "+error);
    }
});
app.get("/login", async (req, res) => {
   
    try {
         // Validation of data
        //  validateLoginData(req)
        const { emailId, password} = req.body;
        // Encrypt the password
        const userFound = await User.findOne({ emailId });
        
        if(!userFound) {
            throw new Error('No user found')
        }
        const isPassowordValid = await bcrypt.compare(password, userFound.password);
        
        if(isPassowordValid) {
            res.send('Login Successfull');
        } else {
           throw new Error('Wrong Password')
        }
        
    } catch (error) {
        res.status(400).send("Cannot Login user, "+error);
    }
});
app.get("/user", async (req, res) => {
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
    const ALLOWED_UPDATES = ['photoUrl', 'about', 'gender', 'age', 'skills'];
    const data = req.body;
    const isUpdatesAllowed = Object.keys(data).every(k => ALLOWED_UPDATES.includes(k));
    if(data?.skills.length > 10) {
        throw new Error('Skills cannot be more than 10')
    }
    if(!isUpdatesAllowed) {
        throw new Error('Updates not allowed')
    }
    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true
    });
    console.log(user);
    res.status(200).send("User Updated");
  } catch (error) {
    res.status(500).send("Cannot update user, "+error);
  }
});
app.get("/feed", async (req, res) => {
  try {
    const found = await User.find({});
    if (found.length === 0) res.status(404).send("No feed found");
    else res.status(200).send(found);
  } catch (err) {
    console.log("Cannot find users,", err);
    res.status(500).send("Cannot find users");
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
