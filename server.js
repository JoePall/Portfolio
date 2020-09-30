const express = require("express");
const app = express();
const PORT = process.env.PORT || 7000;
const exphbs = require("express-handlebars");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set Handlebars.

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
const routes = require("./controllers/homeController.js");

app.use(routes);

app.listen(PORT, () => console.log("http://localhost:" + PORT));
