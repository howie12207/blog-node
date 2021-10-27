const router = require("express").Router();
const ObjectId = require("mongodb").ObjectId;
const DB = require("./db");
const msg = require("./message.json");
const auth = require("./auth.js");

const COMMENT = "comments";

// 創建留言
router.post("/", async (req, res) => {
  try {
    const { account, content, articleId } = req.body;
    if (!account || !content || !articleId) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const params = {
      createTime: new Date(),
      account,
      content,
      articleId: ObjectId(articleId),
    };
    const result = await DB.insert(COMMENT, params);
    res.send({ code: 200, data: true });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得所有留言 (須權限)
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
      DB.findTable(COMMENT, params),
      DB.findCount(COMMENT, params),
    ]);
    res.send({ code: 200, data: { content, totalElements } });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得某篇文章留言 (不須權限)
router.get("/:id", async (req, res) => {
  try {
    const {
      articleId,
      sort = { createTime: -1 },
      page = 0,
      size = 10,
    } = req.query;
    const params = {
      where: { articleId: ObjectId(articleId) },
      sort,
      limit: Number(size),
      skip: Number(page) * Number(size),
    };
    const [content, totalElements] = await Promise.all([
      DB.findTable(COMMENT, params),
      DB.findCount(COMMENT, params),
    ]);
    res.send({ code: 200, data: { content, totalElements } });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 刪除指定留言
router.delete("/:id", async (req, res) => {
  try {
    if (auth(req) !== "admin")
      return res.send({ code: 401, message: msg["401"] });
    if (!req.params.id) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const result = await DB.remove(COMMENT, { _id: ObjectId(req.params.id) });
    res.send({ code: 200, data: true });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});

module.exports = router;
