const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 80;

require("dotenv").config();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userRoute = require("./utils/user");
const aboutRoute = require("./utils/about");
const articleRoute = require("./utils/article");
const sortRoute = require("./utils/sort");
const worksRoute = require("./utils/works");

app.use("/", userRoute);
app.use("/about", aboutRoute);
app.use("/article", articleRoute);
app.use("/sort", sortRoute);
app.use("/works", worksRoute);

app.listen(port, function () {
  console.log(`CORS-enabled web server listening on port ${port}`);
});
