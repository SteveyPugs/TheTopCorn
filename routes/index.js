var express = require("express");
var bcrypt = require("bcrypt");
var async = require("async");
var lodash = require("lodash");
var us = require("us")
var cookieParser = require("cookie-parser");
var router = express.Router();
router.use(cookieParser("PoPcOrN"));
var models = require("../models");
router.get("/", function(req, res){
	res.render("index", {
		cookie: req.cookies.User
	});
});

router.get("/new-location", function(req, res){
	if(req.cookies.User){
		async.parallel({
			environmenttypes: function(callback){
				models.EnvironmentType.findAll({
					attributes: ["EnvironmentType", "EnvironmentTypeID"],
					order: "EnvironmentType"
				}).then(function(environmenttypes){
					var environmenttypes = lodash.map(environmenttypes, "dataValues");
					callback(null, environmenttypes);
				});
			},
			locationtypes: function(callback){
				models.LocationType.findAll({
					attributes: ["LocationType", "LocationTypeID"],
					order: "LocationType"
				}).then(function(locationtypes){
					var locationtypes = lodash.map(locationtypes, "dataValues");
					callback(null, locationtypes);
				});
			},
			pricelevels: function(callback){
				models.PriceLevel.findAll({
					attributes: ["PriceLevel", "PriceLevelID"],
					order: "PriceLevel"
				}).then(function(pricelevels){
					var pricelevels = lodash.map(pricelevels, "dataValues");
					callback(null, pricelevels);
				});
			}
		}, function(err, results){
			if(err) res.send(err);
			res.render("new-location", {
				cookie: req.cookies.User,
				dropdowns: results,
				states: us.STATES
			});
		});
	}
	else{
		res.redirect("/login");
	}
});

router.post("/new-location", function(req, res){
	if(req.cookies.User){
		models.Location.create({
			LocationName: req.body.LocationName,
			LocationAddress: req.body.LocationAddress,
			LocationCity: req.body.LocationCity,
			LocationState: req.body.LocationState,
			CreatedByUserID: req.cookies.User.UserID,
			LocationTypeID: req.body.LocationTypeID,
			PriceLevelID: req.body.PriceLevelID,
			EnvironmentTypeID: req.body.EnvironmentTypeID,
			LocationState: req.body.LocationState,
		}).then(function(newlocation){
			models.Review.create({
				ReviewRating: req.body.ReviewRating,
				ReviewText: req.body.ReviewText,
				LocationID: newlocation.LocationID,
				UserID: req.cookies.User.UserID,
			}).then(function(newreview){
				var newFlavors = [];
				lodash.forEach(req.body.LocationFlavors, function(f){
					newFlavors.push({
						LocationID: newlocation.LocationID,
						LocationFlavor: f
					})
				});
				models.LocationFlavor.bulkCreate(newFlavors).then(function(newreview){
					res.send("success");
				}).catch(function(err){
					console.log(err);
					res.send(err);
				});
			}).catch(function(err){
				console.log(err);
				res.send(err);
			});
		}).catch(function(err){
			console.log(err);
			res.send(err);
		});
	}
	else{
		res.redirect("/login");
	}
});

router.post("/flavors", function(req, res){
	if(req.cookies.User){
		models.LocationFlavor.findAll({
			order: "LocationFlavor"
		}).then(function(flavors){
			res.send(lodash.map(flavors, "dataValues.LocationFlavor"));
		});	
	}
	else{
		res.redirect("/login");
	}
});

router.post("/register", function(req, res){
	models.User.create({
		UserEmail: req.body.UserEmail,
		UserPassword: bcrypt.hashSync(req.body.UserPassword, bcrypt.genSaltSync(10)),
		UserFullName: req.body.UserFullName
	}).then(function(user){
		res.send("success");
	}).catch(function(err){
		res.send(err);
	});
});

router.post("/login", function(req, res){
	models.User.find({
		where: {
	 		UserEmail: req.body.UserEmail,
	 		deletedAt: null
 		}
 	}).then(function(user){
 		if(user){
	 		if(bcrypt.compareSync(req.body.UserPassword, user.UserPassword)){
	 			res.cookie("User", {
	 				UserID: user.UserID,
	 				UserFullName: user.UserFullName,
	 			}, {
	 				expires: new Date(Date.now() + 14400000)
	 			});
	 			res.send(true);
	 		}
	 		else{
	 			res.send(false);
	 		}
 		}
 		else{
 			res.send(false);
 		}
 	}).catch(function(err){
 		res.send(err);
 	});
});

router.get("/logout", function(req, res){
	res.clearCookie("User");
	res.redirect(req.header("Referer"));
});

module.exports = router;