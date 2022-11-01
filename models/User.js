module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        type: DataTypes.STRING
      },
      lastName: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING
      },
      password: {
        type: DataTypes.STRING
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      token: {
        type: DataTypes.STRING,
      },
      socialUserId:DataTypes.STRING,
      registrationType:DataTypes.ENUM("email","google","facebook")
    },
   {freezeTableName:true}


  ).sync();

  return User;
};
