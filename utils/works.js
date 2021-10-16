const router = require("express").Router();
const ObjectId = require("mongodb").ObjectId;
const DB = require("./db");
const msg = require("./message.json");
const auth = require("./auth.js");

const WORKS = "works";

// 創建作品
router.post("/", async (req, res) => {
  try {
    // if (auth(req) !== "admin")
    //   return res.send({ code: 401, message: msg["401"] });
    const {
      name,
      img,
      pathCode,
      pathDemo,
      url,
      order,
      status,
      recommend,
      content,
      updateTime,
      createTime,
    } = req.body;
    if (
      !name ||
      !createTime ||
      !img ||
      !pathCode ||
      !pathDemo ||
      !url ||
      status === undefined ||
      recommend === undefined ||
      !content ||
      !updateTime ||
      !createTime
    ) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const params = {
      name,
      img,
      pathCode,
      pathDemo,
      url,
      order,
      status,
      recommend,
      content,
      updateTime,
      createTime,
    };
    await DB.insert(WORKS, params);
    res.send({ code: 200, data: true });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得所有作品 (須權限)
router.get("/all", async (req, res) => {
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
      DB.findTable(WORKS, params),
      DB.findCount(WORKS, params),
    ]);
    res.send({ code: 200, data: { content, totalElements } });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得所有上架作品 (前台用不須權限)
router.get("/", async (req, res) => {
  try {
    const {
      where = { status: 1 },
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
      DB.findTable(WORKS, params),
      DB.findCount(WORKS, params),
    ]);
    res.send({ code: 200, data: { content, totalElements } });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得推薦作品 (不須權限)
router.get("/recommend", async (req, res) => {
  try {
    const {
      where = { status: 1, recommend: true },
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
      DB.findTable(WORKS, params),
      DB.findCount(WORKS, params),
    ]);
    res.send({ code: 200, data: { content, totalElements } });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 更新作品
router.put("/:id", async (req, res) => {
  try {
    // if (auth(req) !== "admin")
    //   return res.send({ code: 401, message: msg["401"] });
    const {
      name,
      img,
      pathCode,
      pathDemo,
      url,
      order,
      status,
      recommend,
      content,
      updateTime,
      createTime,
    } = req.body;
    if (
      !name ||
      !createTime ||
      !img ||
      !pathCode ||
      !pathDemo ||
      !url ||
      status === undefined ||
      recommend === undefined ||
      !content ||
      !updateTime
    ) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const params = {
      name,
      img,
      pathCode,
      pathDemo,
      url,
      order,
      status,
      recommend,
      content,
      updateTime,
      createTime,
    };
    await DB.update(WORKS, { _id: ObjectId(req.body._id) }, params);
    res.send({ code: 200, data: true });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 刪除指定作品
router.delete("/:id", async (req, res) => {
  try {
    // if (auth(req) !== "admin")
    //   return res.send({ code: 401, message: msg["401"] });
    if (!req.params.id) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    await DB.remove(WORKS, { _id: ObjectId(req.params.id) });
    res.send({ code: 200, data: true });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});

module.exports = router;
