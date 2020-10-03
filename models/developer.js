module.exports = function(sequelize, DataTypes) {
  const Developer = sequelize.define("Developer", {
    developerID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    AvatarURL: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    githubURL: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  return Developer;
};
