"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Person extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Person.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      socailUserId: DataTypes.STRING,
      isVerified: DataTypes.BOOLEAN,
      token: DataTypes.STRING,
      registrationType: DataTypes.ENUM("google", "facebook", "email"),
      loggedIn: DataTypes.INTEGER,
      lastSession: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Person",
    }
  );
  return Person;
};
