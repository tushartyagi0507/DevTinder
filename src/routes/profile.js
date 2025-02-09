const { object } = require("zod");
const { userAuth } = require("../middlewares/userAuth");
const { Router } = require("express");
const { UserModel } = require("../models/user");
const bcrypt = require("bcrypt");

const profileRouter = Router();

profileRouter.get("/profile", userAuth, function (req, res) {
  try {
    const user = req.user;
    res.status(200).json({ data: user });
  } catch (e) {
    res.status(401).json({ message: e.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async function (req, res) {
  try {
    const user = req.user;
    const editAllowed = ["FirstName", "LastName", "age", "photoUrl", "about"];
    const isAllowed = Object.keys(req.body).every((field) =>
      editAllowed.includes(field)
    );
    if (!isAllowed) {
      return res.status(400).json({ message: "You cannot change this field" });
    }
    Object.keys(req.body).forEach((field) => {
      user[field] = req.body[field];
    });

    await user.save();

    res.json({
      message: "you have successfully updated your profile",
      user,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

profileRouter.patch(
  "/profile/change-password",
  userAuth,
  async function (req, res) {
    try {
      const user = req.user;
      const { oldPassword, newPassword } = req.body;
      const confirmedPassword = await bcrypt.compare(
        oldPassword,
        user.password
      );
      if (!confirmedPassword) {
        throw new Error("Old password is incorrect");
      }
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message: "Both old and new passwords are required",
        });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      res.send(200).json({ message: "Password changed successfully" });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

module.exports = { profileRouter };
