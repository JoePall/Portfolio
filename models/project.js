module.exports = function(sequelize, DataTypes) {
  const Project = sequelize.define("Project", {
    projectID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Data: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Screenshots: {
      type: DataTypes.TEXT
    }
  });

  console.log("models/project.js: 17");

  return Project;
};
