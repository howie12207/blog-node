// 權限檢查;
function auth(req) {
  const token = req.headers["x-token"];
  return jwt.verify(token, process.env.JWT_KEY, (_, decode) => {
    return decode && decode.level;
  });
}
