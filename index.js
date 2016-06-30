var config = require("./config");
var express = require("express");
var exphbs = require("express-handlebars");
var handlebars = require("handlebars");
var bodyParser = require("body-parser");
var moment = require("moment");
var http = require("http");
var https = require("https");
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
	partialsDir: "views/partials/",
	helpers: {
		rating: function(context, options){
			var rating = "";
			for(var i = 1, j = Math.round(context); i <= j; i++) {
				rating = rating + "&nbsp;<span class='glyphicon glyphicon-star aria-hidden='true'></span>";
			}
			for(var i = 1, j = 5 - Math.round(context); i <= j; i++) {
				rating = rating + "&nbsp;<span class='glyphicon glyphicon-star-empty' aria-hidden='true'></span>";
			}
			return new handlebars.SafeString(rating);
		},
		dateFormat: function(context, block){
			var f = block.hash.format || "MMM Do, YYYY";
			return moment(context).utc().format(f);
		}
	}
}));
app.set("view engine", ".html");
var httpServer = http.createServer(app);
var httpsServer = https.createServer(config.server.certs, app);
if(config.server.tls){
	httpsServer.listen(config.server.port, config.server.host, function(){
		console.log("https://" + config.server.host + ":" + config.server.port);
	});
}
else{
	httpServer.listen(config.server.port, config.server.host, function(){
		console.log("http://" + config.server.host + ":" + config.server.port);
	});
}