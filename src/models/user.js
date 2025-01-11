const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        minLength: 5,
        maxLength: 50,
        required: true
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)) {
                throw new Error('Email is not valid'+value)
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate(value) {
            if(!["male","female","others"].includes(value)) {
                throw new Error('Gender is not valid')
            }
        }
    },
    photoUrl: {
        type: String,
        default: 'https://commons.wikimedia.org/wiki/File:Default-welcomer.png',
        validate(value){
            if(!validator.isURL(value)) {
                throw new Error('Invalid photo URL: '+value)
            }
        }
    },
    about: {
        type: String, 
        default: "This is default description of user!"
    },
    skills: {
        type: [String]
    }
}, {timestamps: true});

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, "some$DevTinder#5df5", { expiresIn: "7d" });
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputByUser) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser,passwordHash);
    return isPasswordValid;
}

module.exports = mongoose.model("User", userSchema);