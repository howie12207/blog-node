const router = require("express").Router();
const jwt = require("jsonwebtoken");
const DB = require("./db");
const msg = require("./message.json");
const auth = require("./auth.js");

const USER = "users";

// 登入 (不須權限)
router.post("/login", async (req, res) => {
  try {
    const { account, password } = req.body;
    if (!account || !password) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const params = { account, password };
    const result = await DB.findOne(USER, params);
    if (result) {
      const token = jwt.sign(
        { account, level: result.level },
        process.env.JWT_KEY,
        {
          expiresIn: 60 * 60 * 24,
        },
      );
      res.send({ code: 200, data: { token } });
    } else {
      res.send({ code: 1001, message: msg["1001"] });
    }
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// // 註冊 (不須權限)
router.post("/register", async (req, res) => {
  try {
    const { account, password, name, email } = req.body;
    if (!account || !password || !name || !email)
      return res.send({ code: 400, message: msg["400"] });
    const exist = await DB.findOne(USER, { account });
    if (exist) return res.send({ code: 1002, message: msg["1002"] });
    const params = {
      account,
      password,
      name,
      email,
      createTime: Date.now(),
      roleId: 3,
    };
    await DB.insert(USER, params);
    res.send({ code: 200, data: true });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// // 取得所有會員
// router.get("/", async (req, res) => {
//   try {
//     if (auth(req) !== "admin")
//       return res.send({ code: 401, message: msg["401"] });
//     const {
//       where = {},
//       sort = { createTime: -1 },
//       page = 0,
//       size = 10,
//     } = req.query;
//     const params = {
//       where,
//       sort,
//       limit: Number(size),
//       skip: Number(page) * Number(size),
//     };
//     const [content, totalElements] = await Promise.all([
//       DB.findTable(USER, params),
//       DB.findCount(USER, params),
//     ]);
//     const list = content.map((item) => {
//       return {
//         account: item.account,
//         email: item.email,
//         roleId: item.level === "admin" ? 0 : 2,
//         _id: item._id,
//         createTime: item.createTime,
//       };
//     });
//     res.send({ code: 200, data: { content: list, totalElements } });
//   } catch (err) {
//     res.send({ code: 500, message: msg["500"] });
//   }
// });
// // 取得會員資料
router.get("/info", async (req, res) => {
  const token = req.headers["x-token"];
  try {
    const decode = jwt.decode(token, process.env.JWT_KEY);
    if (!decode) return res.send({ code: 401, message: msg["401"] });
    const result = await DB.findOne(USER, { account: decode.account });
    if (result) {
      const USER = {
        account: result.account,
        roleId: result.roleId,
        name: result.name,
        email: result.email,
      };
      return res.send({ code: 200, data: USER });
    }
    return res.send({ code: 401, message: msg["401"] });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// // 修改密碼
// router.put("/password", async (req, res) => {
//   const token = req.headers["x-token"];
//   try {
//     const decode = jwt.decode(token, process.env.JWT_KEY);
//     const findAccount = await DB.findOne(USER, { account: decode.account });
//     if (findAccount) {
//       const { oldPassword, newPassword } = req.body;
//       if (findAccount.password === oldPassword) {
//         const _id = { _id: ObjectId(findAccount._id) };
//         await DB.update(USER, _id, { password: newPassword });
//         return res.send(true);
//       }
//       return res.send({ code: 1003, message: msg["1003"] });
//     }
//     return res.send({ code: 401, message: msg["401"] });
//   } catch (err) {
//     res.send({ code: 500, message: msg["500"] });
//   }
// });
// // 更新會員資料
// router.put("/:id", async (req, res) => {
//   try {
//     if (auth(req) !== "admin")
//       return res.send({ code: 401, message: msg["401"] });
//     const { email, password } = req.body;
//     const params = {};
//     if (email) params.email = email;
//     if (password) params.password = password;
//     const _id = { _id: ObjectId(req.body._id) };
//     await DB.update(USER, _id, params);
//     res.send(true);
//   } catch (err) {
//     res.send({ code: 500, message: msg["500"] });
//   }
// });
// // 刪除指定會員
// router.delete("/:id", async (req, res) => {
//   try {
//     if (auth(req) !== "admin")
//       return res.send({ code: 401, message: msg["401"] });
//     if (!req.params.id) {
//       res.send({ code: 400, message: msg["400"] });
//       return;
//     }
//     const result = await DB.remove(USER, { _id: ObjectId(req.params.id) });
//     res.send(result);
//   } catch (err) {
//     res.send({ code: 500, message: msg["500"] });
//   }
// });

module.exports = router;
