const router = require("express").Router();
const ObjectId = require("mongodb").ObjectId;
const DB = require("./db");
const msg = require("./message.json");
const auth = require("./auth.js");

const ARTICLE = "articles";

// 創建文章
router.post("/", async (req, res) => {
  try {
    if (auth(req) !== "admin")
      return res.send({ code: 401, message: msg["401"] });
    const { name, content, createTime, updateTime, sorts } = req.body;
    if (!name || !content || !createTime || !updateTime) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const params = { name, content, createTime, updateTime, sorts };
    await DB.insert(ARTICLE, params);
    res.send(true);
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得所有文章 (不須權限)
router.get("/", async (req, res) => {
  try {
    const {
      where = {},
      sort = { createTime: -1 },
      page = 0,
      size = 10,
    } = req.query;
    const params = {
      where,
      sort,
      limit: Number(size),
      skip: Number(page) * Number(size),
    };
    const [content, totalElements] = await Promise.all([
      DB.findTable(ARTICLE, params),
      DB.findCount(ARTICLE, params),
    ]);
    res.send({ code: 200, data: { content, totalElements } });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得指定文章 (不須權限)
router.get("/:id", async (req, res) => {
  try {
    const result = await DB.findOne(ARTICLE, { _id: ObjectId(req.params.id) });
    res.send({ code: 200, data: result });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 更新指定文章
router.put("/:id", async (req, res) => {
  try {
    if (auth(req) !== "admin")
      return res.send({ code: 401, message: msg["401"] });
    const { name, content, createTime, updateTime, sorts } = req.body;
    if (!name || !content || !createTime || !updateTime) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const params = { name, content, createTime, updateTime, sorts };
    const _id = { _id: ObjectId(req.body._id) };
    await DB.update(ARTICLE, _id, params);
    res.send(true);
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 刪除指定文章
router.delete("/:id", async (req, res) => {
  try {
    if (auth(req) !== "admin")
      return res.send({ code: 401, message: msg["401"] });
    if (!req.params.id) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const result = await DB.remove(ARTICLE, { _id: ObjectId(req.params.id) });
    await DB.removeMany(COMMENTS, { articleId: ObjectId(req.params.id) });
    res.send(result);
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});

module.exports = router;
