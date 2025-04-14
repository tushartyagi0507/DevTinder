const express = require("express");
const { dbConnect } = require("./config/db");
const { authRouter } = require("./routes/auth");
const cookieParser = require("cookie-parser");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/request");
const { userRouter } = require("./routes/user");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { initializeSocket } = require("./utils/socket");
const { chatRouter } = require("./routes/chat");
require("dotenv").config();
const app = express();

dbConnect();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  "public/uploads",
  express.static(path.join(__dirname, "public/uploads"))
);

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/user", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

const PORT = 3000;
server.listen(PORT, function () {
  console.log(`Server is running on port: ${PORT}`);
});
