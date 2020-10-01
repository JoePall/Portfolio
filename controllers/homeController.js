const express = require("express");
const request = require("request");
const router = express.Router();
const fs = require("fs");
const filePath = "./projects.json";
const github = {
    User: "JoePall",
}

router.get("/update", function (req, res) {
    console.log("refreshing data");

    getProjects()
    .then(attachCollaborators)
    .then(attachScreenshots)
    .then(result => {
        console.log(result);        
        storeProjects(result);
        res.render("index", { Projects: result });
    });
});

router.get("/", function (req, res) {
    let rawData = fs.readFileSync(filePath, "utf8");
    let contents = JSON.parse(rawData);
    console.log("rendering from json");
    let projects = [];
    contents.Data.forEach(x => {
        if (x) {
            console.log(x);
            projects.push(x);
        }
    });
    res.render("index", { Projects: projects });
});

function storeProjects(projects) {
    fs.writeFileSync(filePath, JSON.stringify({ Date: new Date().toDateString(), Data: projects }, null, 4));
}

function getProjects() {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            uri: 'https://api.github.com/users/' + github.User + '/repos',
            json: true,
            headers: {
                'User-Agent': github.User
            }
        }
        
        request(options, (error, response, data) => {
            if (error) reject(error);
            resolve(Object.keys(data).map(key => {
                return {
                    name: data[key].name,
                    url: data[key].html_url,
                    description: data[key].description,
                    website: data[key].homepage,
                    contributors_url: data[key].contributors_url
                };
            }));
        });
    });
}

function attachCollaborators(projects) {
    let requests = projects.map(project => {
        return new Promise((resolve, reject) => {
            project.contributors = [];
            var op = {
                method: 'GET',
                uri: project.contributors_url,
                json: true,
                headers: {
                    'User-Agent': github.User
                }
            };

            request(op, (error, response, body) => {
                if (error) reject(error);    
                if (body) {
                    console.log(body);
                    body.forEach(contributor => {
                        project.contributors.push({
                            avatar_url: body.avatar_url,
                            login: body.login,
                            html_url: body.html_url
                        });
                    });
                }
                resolve(project);
            });
        });
    });

    return Promise.all(requests).then(result => {
        console.log(result);
        return result;
    });
}


function attachScreenshots(projects) {
    console.log("attachScreenshots");
    let requests = projects.map(project => {
        return new Promise((res, rej) => {
            try {
                console.log(project.name);
                project.screenshots = [];
                let readme = "https://raw.githubusercontent.com/" + github.User + "/" + project.name + "/master/README.md";
                request(readme, (err, data, body) => {
                    console.log(project.name + " in request");
                    try {
                        if (err) rej(err);
                        if (body.toString().startsWith("404")) return console.log("404");;
                        let images = body.match(/.*.[.*.]?http.*.png/gi);
                        if (images) {
                            images.forEach(img => {
                                let parts = img.split("](")
                                let screenshot = { 
                                    url: parts[1],
                                    alt: parts[0].replace("![", "")
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
                res(project);
            }
        });
    });

    return Promise.all(requests).then(result => {
        return result;
    });
}

module.exports = router;
