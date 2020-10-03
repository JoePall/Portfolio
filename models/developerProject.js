module.exports = function(sequelize, DataTypes) {
  const DeveloperProject = sequelize.define("DeveloperProject", {
    developerID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    projectID: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  console.log("models/developerProject.js: 13");

  return DeveloperProject;
};
