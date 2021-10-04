const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 80;

require("dotenv").config();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userRoute = require("./user");
const aboutRoute = require("./about");
const articleRoute = require("./article");
const sortRoute = require("./sort");
const worksRoute = require("./works");

app.use("/", userRoute);
app.use("/about", aboutRoute);
app.use("/article", articleRoute);
app.use("/sort", sortRoute);
app.use("/works", worksRoute);

app.listen(port, function () {
  console.log(`CORS-enabled web server listening on port ${port}`);
});
