const Socket = require("socket.io");

const initializeSocket = (server) => {
  const io = Socket(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("join", ({ firstName, userId, touserId }) => {
      const room = [userId, touserId].sort().join("-");
      console.log(`${firstName} joined room: ${room}`);
      socket.join(room);
    });

    socket.on("leave", (room) => {
      console.log(`User left room: ${room}`);
      socket.leave(room);
    });

    socket.on("message", ({ firstName, userId, touserId, message }) => {
      console.log(`Message from ${firstName}: ${message}`);
      const room = [userId, touserId].sort().join("-");
      io.to(room).emit("messageReceived", {
        firstName,
        message,
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

module.exports = { initializeSocket };
