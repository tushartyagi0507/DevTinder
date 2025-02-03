const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      // ref: "User",
      required: true,
      ref: "user",
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "accepted", "rejected", "ignored", "interested"],
        message: "{VALUE} is not supported",
      },
    },
  },
  {
    timestamps: true,
  }
);

const ConnectionRequestModel = mongoose.model(
  "connectionRequest",
  connectionRequestSchema
);

module.exports = { ConnectionRequestModel };
