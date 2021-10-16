const router = require("express").Router();
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const DB = require("./db");
const msg = require("./message.json");
// const auth = require("./auth.js");

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
    if (result && result.status) {
      const token = jwt.sign({ account }, process.env.JWT_KEY, {
        expiresIn: 60 * 60 * 24,
      });
      res.send({ code: 200, data: { token } });
    } else if (result && result.status === 0) {
      res.send({ code: 1004, message: msg["1004"] });
    } else {
      res.send({ code: 1001, message: msg["1001"] });
    }
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});

// 註冊 (不須權限)
router.post("/register", async (req, res) => {
  try {
    const { account, password, name, status = 1, email } = req.body;
    if (!account || !password || !name || !email)
      return res.send({ code: 400, message: msg["400"] });
    const exist = await DB.findOne(USER, { account });
    if (exist) return res.send({ code: 1002, message: msg["1002"] });
    const params = {
      account,
      password,
      name,
      email,
      status,
      createTime: Date.now(),
      roleId: 3,
    };
    await DB.insert(USER, params);
    res.send({ code: 200, data: true });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 修改密碼
router.put("/password", async (req, res) => {
  const token = req.headers["x-token"];
  try {
    const decode = jwt.decode(token, process.env.JWT_KEY);
    const findAccount = await DB.findOne(USER, { account: decode.account });
    if (findAccount) {
      const { oldPassword, newPassword } = req.body;
      if (findAccount.password === oldPassword) {
        const _id = { _id: ObjectId(findAccount._id) };
        await DB.update(USER, _id, { password: newPassword });
        return res.send(true);
      }
      return res.send({ code: 1003, message: msg["1003"] });
    }
    return res.send({ code: 401, message: msg["401"] });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});

// 取得所有會員
router.get("/user/member", async (req, res) => {
  try {
    // if (auth(req) !== "admin")
    //   return res.send({ code: 401, message: msg["401"] });
    const {
      where = { roleId: 3 },
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
      DB.findTable(USER, params),
      DB.findCount(USER, params),
    ]);
    const list = content.map((item) => {
      return {
        account: item.account,
        name: item.name,
        email: item.email,
        status: item.status,
        _id: item._id,
        createTime: item.createTime,
      };
    });
    res.send({ code: 200, data: { content: list, totalElements } });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 取得會員資料
router.get("/info", async (req, res) => {
  const token = req.headers["x-token"];
  try {
    const decode = jwt.decode(token, process.env.JWT_KEY);
    if (!decode) return res.send({ code: 401, message: msg["401"] });
    const result = await DB.findOne(USER, { account: decode.account });
    if (result) {
      const USER = {
        account: result.account,
        name: result.name,
        email: result.email,
        auth: result.auth,
      };
      return res.send({ code: 200, data: USER });
    }
    return res.send({ code: 401, message: msg["401"] });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 更新會員資料
router.put("/user/member/:id", async (req, res) => {
  try {
    // if (auth(req) !== "admin")
    //   return res.send({ code: 401, message: msg["401"] });
    const { name, email, password, status } = req.body;
    if (!name || !email || status === undefined)
      return res.send({ code: 400, message: msg["400"] });
    const params = { email, name, status };
    if (password) params.password = password;
    await DB.update(USER, { _id: ObjectId(req.body._id) }, params);
    res.send({ code: 200, data: USER });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 刪除指定會員
router.delete("/user/member/:id", async (req, res) => {
  try {
    // if (auth(req) !== "admin")
    //   return res.send({ code: 401, message: msg["401"] });
    if (!req.params.id) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const result = await DB.remove(USER, { _id: ObjectId(req.params.id) });
    res.send({ code: 200, data: USER });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});

// 取得所有管理員 (須權限)
router.get("/user/admin", async (req, res) => {
  try {
    // if (auth(req) !== "admin")
    //   return res.send({ code: 401, message: msg["401"] });
    const {
      where = { roleId: 2 },
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
      DB.findTable(USER, params),
      DB.findCount(USER, params),
    ]);
    const list = content.map((item) => {
      return {
        account: item.account,
        name: item.name,
        email: item.email,
        status: item.status,
        _id: item._id,
        createTime: item.createTime,
        auth: item.auth,
      };
    });
    res.send({ code: 200, data: { content: list, totalElements } });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 創建管理員 (須權限)
router.post("/user/admin", async (req, res) => {
  try {
    const { account, password, name, status, email, auth } = req.body;
    if (!account || !password || !name || !status || !email || !auth)
      return res.send({ code: 400, message: msg["400"] });
    const exist = await DB.findOne(USER, { account });
    if (exist) return res.send({ code: 1002, message: msg["1002"] });
    const params = {
      account,
      password,
      name,
      email,
      status,
      createTime: Date.now(),
      roleId: 2,
      auth,
    };
    await DB.insert(USER, params);
    res.send({ code: 200, data: true });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 更新管理員資料
router.put("/user/admin/:id", async (req, res) => {
  try {
    // if (auth(req) !== "admin")
    //   return res.send({ code: 401, message: msg["401"] });
    const { name, email, password, status, auth } = req.body;
    if (!name || !email || status === undefined || !auth)
      return res.send({ code: 400, message: msg["400"] });
    const params = { email, name, status, auth };
    if (password) params.password = password;
    await DB.update(USER, { _id: ObjectId(req.body._id) }, params);
    res.send({ code: 200, data: USER });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});
// 刪除指定管理員
router.delete("/user/admin/:id", async (req, res) => {
  try {
    // if (auth(req) !== "admin")
    //   return res.send({ code: 401, message: msg["401"] });
    if (!req.params.id) {
      res.send({ code: 400, message: msg["400"] });
      return;
    }
    const result = await DB.remove(USER, { _id: ObjectId(req.params.id) });
    res.send({ code: 200, data: USER });
  } catch (err) {
    res.send({ code: 500, message: msg["500"] });
  }
});

/***
 *  read 1  create 2  update 4  delete 8
 *
 */

module.exports = router;
