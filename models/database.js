const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("logindb", "root", "root", {
  host: "localhost",
  dialect: "mysql",
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./User.js")(sequelize, DataTypes);

module.exports = db;
