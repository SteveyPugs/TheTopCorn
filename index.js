var config = require("./config");
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static("static"));
var routes = require("./routes");
app.use("/", routes);
app.engine(".html", exphbs({
	defaultLayout: "main",
	extname: ".html",
	partialsDir: "views/partials/"
}));
app.set("view engine", ".html");
app.listen(config.server.port, config.server.host, function(){
	console.log("http://" + config.server.host + ":" + config.server.port);
});