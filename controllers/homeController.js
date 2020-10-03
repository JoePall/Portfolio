/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */

/* eslint-disable quotes */
module.exports = app => {
  const db = require("../models");
  const request = require("request");
  const fs = require("fs");
  const filePath = "./projects.json";
  const github = {
    User: "JoePall"
  };

  app.get("/", (req, res) => {
    const rawData = fs.readFileSync(filePath, "utf8");
    const contents = JSON.parse(rawData);
    console.log("rendering from json");
    res.render("index", { Projects: contents.Data });
  });

  app.get("/test", (req, res) => {
    getProjects()
      .then(attachCollaborators)
      .then(attachScreenshots)
      .then(projects => {
        projects.forEach(project => {
          if (project) {
            db.Project.create({
              Name: project.name,
              Date: date,
              Data: JSON.stringify(project)
            });
          }
        });
        res.render("index", { Projects: projects });
      });
  });

  function updateDBFromAPI() {
    getProjects()
      .then(attachScreenshots)
      .then(projects => {
        projects.forEach(project => {
          if (project) {
            db.Project.create({
              Name: project.name,
              Date: date,
              Data: JSON.stringify(project)
            });
          }
        });
        return projects;
      });
  }

  function updateProjectsInDB() {
    return new Promise((resolve, reject) => {
      const options = {
        method: "GET",
        uri: "https://api.github.com/users/" + github.User + "/repos",
        json: true,
        headers: {
          "User-Agent": github.User
        }
      };

      request(options, (error, response, data) => {
        if (data.toString().indexOf("API rate limit") > -1) {
          console.log("API LIMIT REACHED");
          res.send('<script>window.location.replace("/transfer")</script>');
          reject("API LIMIT REACHED");
        }

        db.Project.findOrCreate({
          where: {
            id: project.id
          },
          defaults: {
            name: data[key].name,
            url: data[key].html_url,
            description: data[key].description,
            website: data[key].homepage,
            contributors_url: data[key].contributors_url
          }
        });
      });
    });
  }
  function updateCollaborators(projects) {
    projects.forEach(project => {
      return new Promise((resolve, reject) => {
        try {
          if (!project.contributors_url) {
            resolve(project);
            return;
          }
          project.contributors = [];
          const op = {
            method: "GET",
            uri: project.contributors_url,
            json: true,
            headers: {
              "User-Agent": github.User
            }
          };

          request(op, (error, response, body) => {
            console.log(response);
            try {
              if (error) {
                resolve(project);
                return;
              }
              if (body) {
                body.forEach(contributor => {
                  db.Developer.findOrCreate({
                    where: {
                      id: contributor.id
                    },
                    defaults: {
                      id: contributor.id,
                      AvatarURL: contributor.avatar_url,
                      githubURL: contributor.html_url
                    }
                  });

                  console.log("homeController.js: 155");
                  db.DeveloperProject.findOrCreate({
                    where: {
                      developerID: contributor.id,
                      projectID: project.id
                    },
                    defaults: {
                      developerID: contributor.id,
                      projectID: project.id
                    }
                  });
                });
              }
              resolve(project);
            } catch (error) {
              resolve(project);
            }
          });
        } catch (error) {
          resolve(project);
        }
      });
    });

    return Promise.all(requests).then(result => {
      console.log("Contributors: " + console.table(result));
      return result;
    });
  }

  function attachScreenshots(projects) {
    console.log("attachScreenshots");
    const requests = projects.map(project => {
      return new Promise((resolve, rej) => {
        try {
          console.log(project.name);
          project.screenshots = [];
          const readme =
            "https://raw.githubusercontent.com/" +
            github.User +
            "/" +
            project.name +
            "/master/README.md";
          request(readme, (err, data, body) => {
            try {
              if (err) {
                resolve(project);
                return;
              }
              if (body.toString().startsWith("404")) {
                resolve(project);
                return console.log("404");
              }
              const images = body.match(/.*.[.*.]?http.*.png/gi);
              if (images) {
                images.forEach(img => {
                  const parts = img.split("](");
                  const screenshot = {
                    url: parts[1],
                    alt: parts[0].replace("![", "")
                  };
                  project.screenshots.push(screenshot);
                });
              }
              resolve(project);
            } catch (error) {
              resolve(project);
            }
          });
        } catch (error) {
          resolve(project);
        }
      });
    });

    return Promise.all(requests).then(result => {
      console.log(result);
      return result;
    });
  }
};
