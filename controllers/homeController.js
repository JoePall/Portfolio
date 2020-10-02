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
      .then((projects) => {
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

  app.get("/transfer", function(req, res) {
    db.Project.destroy({
        where: {},
        truncate: true
      })
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
    res.send("<script>window.location.replace(\"/\")</script>");
    
  });

  app.get("/", function(req, res) {
    db.Project.findAll().then(data => {
        if (data) {
            res.render("index", { Projects: data.map(x => JSON.parse(x.Data)) });
        }
        else {
            res.send("Issue loading...");
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
              if (error) resolve(error);
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
              resolve();
            }
          });
        } catch (error) {
          resolve();
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
              if (err) res();
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
              res();
            }
          });
        } catch (error) {
          console.log("completed screenshots");
          res();
        }
      });
    });

    return Promise.all(requests).then((result) => {
      return result;
    });
  }

  module.exports = app;
};
