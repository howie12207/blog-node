const router = require("express").Router();
const ObjectId = require("mongodb").ObjectId;
const DB = require("./db");
const msg = require("./message.json");
const auth = require("./auth.js");

const SORT = "sorts";

// 創建分類
router.post("/", async (req, res) => {
  try {
    if (auth(req) !== "admin")
      return res.send({ code: 401, message: msg["401"] });
    const { name, createTime } = req.body;
    if (!name || !createTime) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const result = await DB.insert(SORT, req.body);
    res.send(result);
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得所有分類 (不須權限)
router.get("/", async (req, res) => {
  try {
    const params = req.query || {};
    const result = await DB.find(SORT, params, {
      createTime: -1,
    });
    res.send({ code: 200, data: result });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 刪除指定分類
router.delete("/:id", async (req, res) => {
  try {
    if (auth(req) !== "admin")
      return res.send({ code: 401, message: msg["401"] });
    if (!req.params.id) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const result = await DB.remove(SORT, { _id: ObjectId(req.params.id) });
    res.send(result);
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});

module.exports = router;
