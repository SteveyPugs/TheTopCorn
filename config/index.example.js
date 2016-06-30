var fs = require("fs");
var config = {
	server: {
		host: "localhost",
		port: 443,
		tls: true,
		certs: {
			key: fs.readFileSync("file", "utf8"),
			cert: fs.readFileSync("file", "utf8"),
			ca: fs.readFileSync("file", "utf8")
		}
	},
	database:{
		host: "localhost",
		username: "username",
		password: "password",
		database: "database"
	},
	google:{
		key: "KEY"
	},
	images:{
		storage: "/storage"
	}
};

module.exports = config;