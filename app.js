require("dotenv").config();
require("./config/passport");
const express = require("express");
const morgan = require("morgan");
const errorMiddleware = require("./middlewares/error");
const notfoundMiddleware = require("./middlewares/notfound");
const passportJwtMiddleware = require("./middlewares/passportJwt");
const isAdminMiddleware = require("./middlewares/admin");
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const productRoute = require("./routes/productRoute");

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoute);
app.use("/users", passportJwtMiddleware, userRoute);
app.use("/admins", adminRoute);
app.use("/products", isAdminMiddleware, productRoute);

app.use(errorMiddleware);
app.use(notfoundMiddleware);

app.listen(process.env.PORT || 8000, () =>
  console.log(`Sever is running on port ${process.env.PORT}`)
);
