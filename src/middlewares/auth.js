const User = require("../models/user");
const jwt = require("jsonwebtoken");


const adminAuth = (req,res,next) => {
    const token = "xyz";
    const isAdminToken = token === "xyz";
    console.log('Token Verified')
    if(!isAdminToken){
        res.status(401).send("No admin access");
    } else {
        // throw new Error('some error')
        next();
    }
}

const userAuth = async(req,res,next) => {
    try {
        const { token } = req.cookies;
        const decodedMessage = await jwt.verify(token, "some$DevTinder#5df5");
        const { _id } = decodedMessage;
        const user = await User.findById(_id);
    
        if (!user) {
          throw new Error("Invalid token");
        }
        req.user = user;
        next()
      } catch (error) {
        res.status(400).send("Cannot validate token, " + error);
      }
}

module.exports = {adminAuth, userAuth}