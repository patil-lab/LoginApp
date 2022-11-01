const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("logindb", "root", "root", {
  host: "localhost",
  dialect: "mysql",
});

const db = {
  User: require('../models/User.js')
};

Object.keys(db).forEach(modelName => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});


db.Sequelize = Sequelize;
db.sequelize = sequelize;


module.exports = db;
