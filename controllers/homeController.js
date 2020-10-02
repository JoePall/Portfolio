module.exports = function(app) {
  const db = require("../models");
  const request = require("request");
  const fs = require("fs");
  const filePath = "./projects.json";
  const github = {
    User: "JoePall",
  };

  app.get("/update", function(req, res) {
    console.log("refreshing data");

    getProjects()
      .then(attachCollaborators)
      .then(attachScreenshots)
      .then((result) => {
        storeProjects(result);
        res.render("index", { Projects: result });
      });
  });

  app.get("/transfer", function(req, res) {
    let rawData = fs.readFileSync(filePath, "utf8");
    let date = new Date().toDateString();
    let contents = JSON.parse(rawData);
    console.log("rendering from json");
    console.log(date);
    console.log(db.Project);
    contents.Data.forEach(project => {
        if (project) {
            db.Project.create({
                Name: project.name,
                Date: date,
                Data: JSON.stringify(project)
            });
        }
    });
    
  });

  app.get("/", function(req, res) {
    db.Project.findAll().then((projects) => {
      if (projects[0].Date != Date.now.toDateString()) {
        updateData();
      } else {
        res.render("index", { Projects: projects });
      }
    });
  });

  function storeProjects(projects) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        { Date: new Date().toDateString(), Data: projects },
        null,
        4
      )
    );
  }

  function getProjects() {
    return new Promise((resolve, reject) => {
      var options = {
        method: "GET",
        uri: "https://api.github.com/users/" + github.User + "/repos",
        json: true,
        headers: {
          "User-Agent": github.User,
        },
      };

      request(options, (error, response, data) => {
        if (error) reject(error);
        resolve(
          Object.keys(data).map((key) => {
            return {
              name: data[key].name,
              url: data[key].html_url,
              description: data[key].description,
              website: data[key].homepage,
              contributors_url: data[key].contributors_url,
            };
          })
        );
      });
    });
  }

  function attachCollaborators(projects) {
    let requests = projects.map((project) => {
      return new Promise((resolve, reject) => {
        try {
          project.contributors = [];
          var op = {
            method: "GET",
            uri: project.contributors_url,
            json: true,
            headers: {
              "User-Agent": github.User,
            },
          };

          request(op, (error, response, body) => {
            try {
              if (error) reject(error);
              if (body) {
                console.log(body);
                body.forEach((contributor) => {
                  project.contributors.push({
                    avatar_url: body.avatar_url,
                    login: body.login,
                    html_url: body.html_url,
                    commits: body.commits,
                  });
                });
              }
              resolve(project);
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    return Promise.all(requests).then((result) => {
      console.log("completed contributors");
      fs.writeFileSync(
        "test.json",
        JSON.stringify(
          { Date: new Date().toDateString(), Data: result },
          null,
          4
        )
      );
      return result;
    });
  }

  function attachScreenshots(projects) {
    console.log("attachScreenshots");
    let requests = projects.map((project) => {
      return new Promise((res, rej) => {
        try {
          console.log(project.name);
          project.screenshots = [];
          let readme =
            "https://raw.githubusercontent.com/" +
            github.User +
            "/" +
            project.name +
            "/master/README.md";
          request(readme, (err, data, body) => {
            try {
              if (err) rej(err);
              if (body.toString().startsWith("404")) return console.log("404");
              let images = body.match(/.*.[.*.]?http.*.png/gi);
              if (images) {
                images.forEach((img) => {
                  let parts = img.split("](");
                  let screenshot = {
                    url: parts[1],
                    alt: parts[0].replace("![", ""),
                  };
                  project.screenshots.push(screenshot);
                });
              }
              res(project);
            } catch (error) {
              res(project);
            }
          });
        } catch (error) {
          console.log("completed screenshots");
          res(project);
        }
      });
    });

    return Promise.all(requests).then((result) => {
      return result;
    });
  }

  module.exports = app;
};
