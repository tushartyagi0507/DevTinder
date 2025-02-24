const express = require("express");
const { Router } = express;
const { ConnectionRequestModel } = require("../models/connectionRequest");
const { userAuth } = require("../middlewares/userAuth");
const { UserModel } = require("../models/user");

const userRouter = Router();

userRouter.get("/requests/received", userAuth, async function (req, res) {
  try {
    const user = req.user;
    const requests = await ConnectionRequestModel.find({
      toUserId: user._id,
      status: "interested",
    }).populate("fromUserId", [
      "FirstName",
      "LastName",
      "photoUrl",
      "about",
      "age",
    ]);

    if (!requests || requests.length === 0) {
      return res.status(400).send({ message: "No request found" });
    }
    res.status(200).send({ message: "Request found", data: requests });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

userRouter.get("/connections", userAuth, async function (req, res) {
  try {
    const user = req.user;
    const allconnections = await ConnectionRequestModel.find({
      $or: [
        { toUserId: user._id, status: "accepted" },
        { fromUserId: user._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", [
        "FirstName",
        "LastName",
        "photoUrl",
        "gender",
        "about",
        "age",
      ])
      .populate("toUserId", [
        "FirstName",
        "LastName",
        "photoUrl",
        "gender",
        "about",
        "age",
      ]);

    if (!allconnections || allconnections.length === 0) {
      return res.status(400).send({ message: "No connection found" });
    }
    const data = allconnections.map((connection) => {
      if (connection.fromUserId._id.toString() === user._id.toString()) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.status(200).send({ message: "Connection found", data: allconnections });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

userRouter.get("/feed", userAuth, async function (req, res) {
  try {
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit || 0;

    limit = limit > 50 ? 50 : limit;

    // we would hide the user that he has already connected with. either he sent the request or received the request
    try {
      const connectedUsers = await ConnectionRequestModel.find({
        $and: [{ $or: [{ toUserId: user._id }, { fromUserId: user._id }] }],
      }).select("toUserId fromUserId");

      const hideConnections = new Set();
      if (connectedUsers && connectedUsers.length > 0) {
        // Only process when connections exist
        connectedUsers.forEach((entry) => {
          hideConnections.add(entry.toUserId.toString());
          hideConnections.add(entry.fromUserId.toString());
        });
      }

      const users = await UserModel.find({
        $and: [
          { _id: { $nin: Array.from(hideConnections) } },
          { _id: { $ne: user._id } },
        ],
      })
        .select(["FirstName", "LastName", "photoUrl", "about", "age", "gender"])
        .skip(skip)
        .limit(limit);

      if (!users || users.length === 0) {
        return res.json({ data: "No user found" });
      }
      res.status(200).json({
        message: "Users found",
        data: users,
      });
    } catch (error) {
      console.error("Error fetching connections:", error);
      throw error;
    }
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

module.exports = { userRouter };
