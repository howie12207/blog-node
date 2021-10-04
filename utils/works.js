const router = require("express").Router();
const DB = require("./db");
const msg = require("./message.json");
const auth = require("./auth.js");

const WORKS = "works";

// 創建作品
// router.post("/", async (req, res) => {
//   try {
//     if (auth(req) !== "admin")
//       return res.send({ code: 401, message: msg["401"] });
//     const { name, createTime } = req.body;
//     if (!name || !createTime) {
//       res.send({ code: 400, message: msg["400"] });
//       return;
//     }
//     const result = await DB.insert(WORKS, req.body);
//     res.send(result);
//   } catch (err) {
//     res.send({ code: 500, message: msg["500"] });
//   }
// });
// 取得所有作品
router.get("/", async (req, res) => {
  try {
    const params = req.query || {};
    const result = await DB.find(WORKS, params, {
      createTime: -1,
    });
    res.send({ code: 200, data: result });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得推薦作品 (不須權限)
router.get("/recommend", async (req, res) => {
  try {
    const params = req.query || {};
    let result = await DB.find(WORKS, params, {
      createTime: -1,
    });
    result = result.filter((item) => item.active && item.recommend);
    res.send({ code: 200, data: result });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 刪除指定作品
// router.delete("/:id", async (req, res) => {
//   try {
//     if (auth(req) !== "admin")
//       return res.send({ code: 401, message: msg["401"] });
//     if (!req.params.id) {
//       res.send({ code: 400, message: msg["400"] });
//       return;
//     }
//     const result = await DB.remove(WORKS, { _id: ObjectId(req.params.id) });
//     res.send(result);
//   } catch (err) {
//     res.send({ code: 500, message: msg["500"] });
//   }
// });

module.exports = router;
