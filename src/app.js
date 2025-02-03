const express = require("express");
const { dbConnect } = require("./config/db");
const { authRouter } = require("./routes/auth");
const cookieParser = require("cookie-parser");
const { profileRouter } = require("./routes/profile");
const { requestRouter } = require("./routes/request");
const { userRouter } = require("./routes/user");
const cors = require("cors");

const app = express();

dbConnect();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/user", userRouter);

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
