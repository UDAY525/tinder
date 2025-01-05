const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect('mongodb+srv://uday:1234@tindercluster.ktlfe.mongodb.net/devTinder')
};

module.exports = {connectDB};