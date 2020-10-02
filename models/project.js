module.exports = function(sequelize, DataTypes) {
  const Project = sequelize.define("Project", {
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Data: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  return Project;
};
