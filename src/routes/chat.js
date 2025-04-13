const { Router } = require("express");
const { userAuth } = require("../middlewares/userAuth");
const Chat = require("../models/chat").Chat;

const chatRouter = Router();

chatRouter.get("/chat/:touserId", userAuth, async (req, res) => {
  const userId = req.user._id.toString();
  //   console.log(userId);
  const { touserId } = req.params;
  if (!userId || !touserId) {
    return res.status(400).json({ message: "Invalid request" });
  }
  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, touserId] },
    }).populate({
      path: "messages.senderId",
      select: "FirstName",
    });
    if (!chat) {
      chat = new Chat({
        participants: [userId, touserId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
  }
});

module.exports = { chatRouter };
