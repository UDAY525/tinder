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

module.exports = {adminAuth}