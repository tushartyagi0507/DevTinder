const express = require("express");
const { Router } = express;
const { UserModel } = require("../models/user");
const { userAuth } = require("../middlewares/userAuth");
const { ConnectionRequestModel } = require("../models/connectionRequest.js");

const requestRouter = Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async function (req, res) {
    try {
      const user = req.user;
      const { toUserId, status } = req.params;
      const fromUserId = user._id;

      // making sure that user can only send interested request or ignore request
      const allowedStatus = ["interested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // make sure that the toUserId is valid and it is there in our DB
      const istoUserIdValid = await UserModel.findById(toUserId);
      if (!istoUserIdValid) {
        throw new Error("There is no such user with this id");
      }

      // user can't send request to himself
      if (toUserId.toString() === fromUserId.toString()) {
        throw new Error("You can't send request to yourself");
      }

      // checking if the request already exist
      const isRquestExist = await ConnectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });
      if (isRquestExist) {
        throw new Error("Request already exist");
      }

      // saving the entry in the Db
      const request = await ConnectionRequestModel.create({
        fromUserId,
        toUserId,
        status,
      });
      if (!request) {
        return res.status(400).json({ message: "Request not sent" });
      }
      res
        .status(200)
        .json({ message: "Request sent successfully", data: request });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async function (req, res) {
    try {
      const user = req.user;
      const { status, requestId } = req.params;

      //checking the status
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const connectionRequest = await ConnectionRequestModel.findOne({
        _id: requestId,
        toUserId: user._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res.status(400).json({ message: "Request not found" });
      }
      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.status(200).json({ message: "Request reviewed successfully", data });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

module.exports = { requestRouter };
