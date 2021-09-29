const MongoClient = require("mongodb").MongoClient;

class DB {
  // 单例模式
  static getInstance() {
    if (!DB.instance) {
      DB.instance = new DB();
    }
    return DB.instance;
  }

  // 构造函数
  constructor() {
    this.dbClient = null;
    this.connect();
  }

  // 根据配置连接数据库
  connect() {
    return new Promise((resolve, reject) => {
      if (!this.dbClient) {
        const client = new MongoClient(process.env.MONGO_PATH, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        client.connect((err) => {
          if (err) {
            reject(err);
          } else {
            this.dbClient = client.db(process.env.MONGO_DATABASE);
            resolve(this.dbClient);
          }
        });
      } else {
        resolve(this.dbClient);
      }
    });
  }

  /**
   * 插入数据
   * @param {String} collectionName 表名
   * @param {*} json 插入数据
   */
  insert(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).insertOne(json, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  insertMany(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).insertMany(json, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });
    });
  }

  /**
   * 查找
   * @param {String} collectionName 表名
   * @param {*} json 查找条件
   */
  find(collectionName, json, order) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        const collection = db.collection(collectionName);
        collection
          .find(json)
          .sort(order)
          .toArray((err, docs) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(docs);
          });
      });
    });
  }

  findTable(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        const collection = db.collection(collectionName);

        // 取得資料
        collection
          .find(json.where)
          .sort(json.sort)
          .limit(json.limit)
          .skip(json.skip)
          .toArray((err, docs) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(docs);
          });
      });
    });
  }

  findCount(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        const collection = db.collection(collectionName);
        collection.countDocuments(json.where, (err, docs) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(docs);
        });
      });
    });
  }

  findOne(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        const collection = db.collection(collectionName);
        collection.findOne(json, (err, docs) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(docs);
        });
      });
    });
  }

  /**
   * 更新
   * @param {String} collectionName 表名
   * @param {*} json1 查找条件
   * @param {*} json2 更新的数据
   */
  update(collectionName, json1, json2) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).updateOne(
          json1,
          { $set: json2 },
          (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result);
          },
        );
      });
    });
  }

  updatePush(collectionName, json1, json2) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).updateOne(
          json1,
          { $push: json2 },
          (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(result);
          },
        );
      });
    });
  }

  /**
   * 删除
   * @param {String} collectionName 表名
   * @param {*} json 查找条件
   */
  remove(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).deleteOne(json, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(result);
        });
      });
    });
  }

  removeMany(collectionName, json) {
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).deleteMany(json, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(result);
        });
      });
    });
  }
}

module.exports = DB.getInstance();
