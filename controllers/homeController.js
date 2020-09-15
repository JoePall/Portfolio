const express = require("express");
const request = require("request");
const router = express.Router();

router.get("/", function (req, res) {
    var options = {
        method: 'GET',
        uri: 'https://api.github.com/users/JoePall/repos',
        json: true,
        headers: {
            'User-Agent': 'JoePall'
        }
    }
    request(options, (err, response, data) => {
        let result = Object.keys(data).map(key => {
            return {
                name: data[key].name,
                url: data[key].html_url,
                description: data[key].description,
                website: data[key].homepage
            }
        });

        res.render("index", { data: result });
    });
});

module.exports = router;