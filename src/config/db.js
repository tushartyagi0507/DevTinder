const mongoose = require("mongoose");

const dbConnect = function () {
  try {
    mongoose.connect(process.env.DATABASE_URL);
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection error:", err);
  }
};

module.exports = {
  dbConnect,
};
