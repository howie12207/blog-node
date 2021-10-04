const router = require("express").Router();
const ObjectId = require("mongodb").ObjectId;
const DB = require("./db");
const msg = require("./message.json");
const auth = require("./auth.js");

const ABOUT = "about";

// 取得關於內容 (不須權限)
router.get("/", async (req, res) => {
  try {
    const params = req.query || {};
    const result = await DB.find(ABOUT, params);
    res.send({ code: 200, data: result[0] });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
module.exports = router;
