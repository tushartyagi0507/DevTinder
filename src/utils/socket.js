// const Socket = require("socket.io");

// const initializeSocket = (server) => {
//   const io = Socket(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });
//   io.on("connection", (socket) => {
//     socket.on("join", ({ firstName, userId, touserId }) => {
//       const room = [userId, touserId].sort().join("-");
//       //   console.log(`${firstName} joined room: ${room}`);
//       socket.join(room);
//     });

//     socket.on("leave", (room) => {
//       //   console.log(`User left room: ${room}`);
//       socket.leave(room);
//     });

//     socket.on("message", ({ firstName, userId, touserId, message }) => {
//       //   console.log(`Message from ${firstName}: ${message}`);
//       const room = [userId, touserId].sort().join("-");
//       io.to(room).emit("messageReceived", {
//         firstName,
//         message,
//       });
//     });

//     socket.on("disconnect", () => {
//       console.log("A user disconnected");
//     });
//   });
// };

// module.exports = { initializeSocket };

const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, touserId) => {
  return [userId, touserId].sort().join("-");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", ({ firstName, userId, touserId }) => {
      const roomId = getSecretRoomId(userId, touserId);
      //   console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on("message", async ({ firstName, userId, touserId, message }) => {
      //   console.log(`Message from ${firstName}: ${message}`);
      // Save messages to the database
      try {
        const roomId = getSecretRoomId(userId, touserId);
        // console.log(firstName + " " + message);

        let chat = await Chat.findOne({
          participants: { $all: [userId, touserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, touserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text: message,
        });

        await chat.save();
        io.to(roomId).emit("messageReceived", { firstName, message });
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = { initializeSocket };
