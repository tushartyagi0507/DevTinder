const mongoose = require("mongoose");

const dbConnect = function () {
  mongoose.connect(
    "mongodb+srv://tt20199900:Cwg8w5xHRdZomo2c@cluster0.ikofg.mongodb.net/DevTinder"
  );
  console.log("Database connected");
};

module.exports = {
  dbConnect,
};
