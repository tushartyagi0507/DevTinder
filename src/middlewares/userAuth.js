const { UserModel } = require("../models/user");
const { JWT_SECRET } = require("../utils/constants");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Kindly login again");
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

module.exports = { userAuth };
