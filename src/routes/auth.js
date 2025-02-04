const { Router } = require("express");
const { validateData } = require("../utils/valdateData");
const { UserModel } = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_SECRET } = require("../utils/constants");
const { userAuth } = require("../middlewares/userAuth");

const authRouter = Router();

authRouter.post("/signup", async function (req, res) {
  try {
    validateData(req);
    const {
      FirstName,
      LastName,
      email,
      password,
      age,
      photoUrl,
      about,
      gender,
    } = req.body;
    const isUserExist = await UserModel.findOne({
      email,
    });
    if (isUserExist) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 5);

    await UserModel.create({
      FirstName,
      LastName,
      email,
      password: hashedPassword,
      age,
      photoUrl,
      about,
      gender,
    });
    res.status(200).json({ message: "User created successfully" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

authRouter.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({
      email,
    });
    // console.log("user is", user);
    if (!user) {
      throw new Error("User not found");
    }

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      throw new Error("Invalid crednetials");
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );
    res.cookie("token", token, {
      httpOnly: true,
    });
    res
      .status(200)
      .json({ message: "User logged in successfully", data: user });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

authRouter.get("/logout", function (req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully" });
});

module.exports = {
  authRouter,
};
