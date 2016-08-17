var express = require("express");
var bcrypt = require("bcrypt");
var async = require("async");
var lodash = require("lodash");
var Sequelize = require("sequelize");
var us = require("us");
var fs = require("fs");
var cookieParser = require("cookie-parser");
var config = require("../config");
var router = express.Router();
router.use(cookieParser("PoPcOrN"));
var models = require("../models");
var geocoder = require('node-geocoder')("google", "https", {
	apiKey: config.google.key
});
var geoip = require("geoip-lite");
var multer  = require("multer")
var storage = multer.memoryStorage()
var upload = multer({
	storage: storage
});
var lwip = require("lwip");
var mime = require("mime");
var nodemailer = require("nodemailer");
var sesTransport = require("nodemailer-ses-transport");
var transporter = nodemailer.createTransport(sesTransport({
    accessKeyId: config.ses.accessKeyId,
    secretAccessKey: config.ses.secretAccessKey,
    rateLimit: 5
}));

var Chance = require("chance");

router.get("/", function(req, res){
	res.render("index", {
		cookie: req.cookies.User
	});
});

router.get("/locations", function(req, res){
	var c = JSON.parse(req.query.c);
	async.waterfall([
		function(callback){
			if(req.query.l){
				geocoder.geocode(req.query.l).then(function(geo){
					callback(null, geo[0]);
				}).catch(function(err) {
					callback(err);
				});
			}
			else{
				if(req.cookies.User){
					geocoder.geocode(req.cookies.User.UserCity + ", " + req.cookies.User.UserState).then(function(geo){
						callback(null, geo[0]);
					}).catch(function(err) {
						callback(err);
					});
				}
				else{
					if(geoip.lookup(req.headers['x-forwarded-for'] || req.connection.remoteAddress)){
						callback(null, {
							latitude: geoip.lookup(req.headers['x-forwarded-for'] || req.connection.remoteAddress).ll[0],
							longitude: geoip.lookup(req.headers['x-forwarded-for'] || req.connection.remoteAddress).ll[1]
						});
					}
					else{
						geocoder.geocode("New York, NY").then(function(geo){
							callback(null, geo[0]);
						}).catch(function(err) {
							callback(err);
						});
					}
				}
			}
		}
	], function(err, result){
		if(err) res.send(err);
		models.Location.findAll({
			attributes: ["LocationID","LocationName","LocationCity","LocationState", [Sequelize.literal("69.0 * DEGREES(ACOS(COS(RADIANS(" + result.latitude + ")) * COS(RADIANS(LocationLatitude)) * COS(RADIANS(" + result.longitude + ") - RADIANS(LocationLongitude)) + SIN(RADIANS(" + result.latitude + ")) * SIN(RADIANS(LocationLatitude))))"), "LocationDistance"], "LocationTypeID", "EnvironmentTypeID"],
			raw: true,
			include: [{
				model: models.LocationType,
				attributes: ["LocationType"]
			}],
			where:{
				PriceLevelID: lodash.filter(lodash.keys(c), function(key){ return c[key]; }),
				LocationTypeID: req.query.lt || {
					$ne: null
				},
				EnvironmentTypeID: req.query.et || {
					$ne: null
				},
				LocationName: req.query.n ? {
					$like: "%" + req.query.n + "%"
				} : {
					$ne: null
				}
			},
			offset: parseInt(req.query.o),
			limit: 5,
			having: ["LocationDistance <= " + (req.query.d || 5)]
		}).then(function(locations){
			async.parallel({
				reviews: function(callback){
					models.Review.findAll({
						where:{
							deletedAt: null
						},
						raw: true,
					}).then(function(reviews){
						callback(null, reviews);
					}).catch(function(err){
						callback(err);
					});
				},
				flavors: function(callback){
					models.LocationFlavor.findAll({
						where:{
							deletedAt: null
						},
						raw: true,
					}).then(function(flavors){
						callback(null, flavors);
					}).catch(function(err){
						callback(err);
					});
				}
			}, function(err, results){
				if(err) res.send(err);
				lodash.forEach(locations, function(l){
					var reviewCount = 0;
					var reviewPoints = 0;
					lodash.filter(results.reviews, function(r){
						if(l.LocationID === r.LocationID){
							reviewCount ++;
							reviewPoints += r.ReviewRating;
						}
					});
					var flavors = lodash.filter(results.flavors, {
						LocationID: l.LocationID
					});
					l.LocationFlavors = lodash.map(flavors, "LocationFlavor");
					var latestReview = lodash.find(lodash.orderBy(results.reviews, ["createdAt"], ["desc"]), function(r){
						if(l.LocationID === r.LocationID){
							return true;
						}
					});
					l.LatestReview = latestReview.ReviewText;
					l.LatestReviewUserID = latestReview.UserID;
					l.ReviewRating = reviewPoints / reviewCount;
					l.ReviewCount = reviewCount;
				});
				locations = req.query.f ? lodash.filter(locations, function(l){
					if(lodash.includes(l.LocationFlavors, req.query.f)){
						return true;
					}
				}) : locations;
				res.send(lodash.orderBy(locations, ["LocationDistance", "ReviewCount", "ReviewRating"], ["asc", "desc", "desc"]));
			});
		}).catch(function(err){
			res.send(err);
		});
	});
});

router.get("/location/:id", function(req, res){
	models.Location.find({
		where:{
			LocationID: req.params.id
		},
		raw: true,
		attributes:["LocationID","LocationName","LocationAddress","LocationCity","LocationState"],
		include: [{
			model: models.LocationType,
			where: {
				LocationTypeID: Sequelize.col("LocationType.LocationTypeID")
			},
			attributes: ["LocationType"]
		},{
			model: models.PriceLevel,
			where: {
				PriceLevel: Sequelize.col("PriceLevel.PriceLevelID")
			},
			attributes: ["PriceLevel"]
		},{
			model: models.EnvironmentType,
			where: {
				EnvironmentTypeID: Sequelize.col("EnvironmentType.EnvironmentTypeID")
			},
			attributes: ["EnvironmentType"]
		}]
	}).then(function(location){
		async.parallel({
			reviews: function(callback){
				models.Review.findAll({
					where:{
						LocationID: location.LocationID
					},
					order: "createdAt DESC",
					raw: true,
					include: [{
						model: models.User,
						where: {
							UserID: Sequelize.col("User.UserID")
						},
						attributes: ["UserCity", "UserState", "UserName"]
					}]
				}).then(function(reviews){
					callback(null, reviews);
				}).catch(function(err){
					res.send(err);
				});
			},
			flavors: function(callback){
				models.LocationFlavor.findAll({
					where:{
						LocationID: location.LocationID
					},
					raw: true,
				}).then(function(flavors){
					callback(null, flavors);
				}).catch(function(err){
					res.send(err);
				});
			},
			pictures: function(callback){
				models.LocationImage.findAll({
					where:{
						LocationID: location.LocationID
					},
					attributes: ["LocationImageGUID","LocationImageContentType","UserID","createdAt"],
					raw: true,
					limit: 3,
					order: "createdAt DESC"
				}).then(function(images){
					callback(null, images);
				}).catch(function(err){
					res.send(err);
				});
			},
			photocount: function(callback){
				models.LocationImage.count({
					where:{
						LocationID: location.LocationID,
						deletedAt: null
					},
				}).then(function(photocount){
					callback(null, photocount);
				}).catch(function(err){
					res.send(err);
				});
			},
		}, function(err, results){
			if(err) res.send(err);
			var reviewCount = 0;
			var reviewPoints = 0;
			lodash.filter(results.reviews, function(r){
				reviewCount ++;
				reviewPoints += r.ReviewRating;
			});
			location.ReviewRating = reviewPoints / reviewCount;
			location.ReviewCount = reviewCount;
			res.render("location", {
				cookie: req.cookies.User,
				location: location,
				flavors: results.flavors,
				reviews: results.reviews,
				pictures: results.pictures,
				photocount: results.photocount,
				morethenthree: results.photocount > 3 ? true : false
			});
		});
	}).catch(function(err){
		res.send(err);
	});
});

router.get("/location/:id/photos", function(req, res){
	models.Location.find({
		where:{
			LocationID: req.params.id
		},
		raw: true,
		attributes:["LocationID","LocationName"]
	}).then(function(location){
		models.LocationImage.count({
			where:{
				LocationID: location.LocationID
			}
		}).then(function(count){
			models.LocationImage.findAll({
				where:{
					LocationID: location.LocationID
				},
				attributes: ["LocationImageGUID","LocationImageContentType","UserID","createdAt"],
				raw: true,
				limit: req.query.offset ? null : 20,
				order: "createdAt DESC"
			}).then(function(images){
				res.render("location-photo", {
					cookie: req.cookies.User,
					location: location,
					pictures: images,
					more: req.query.offset ? false : (count > 20 ? true : false)
					
				});
			}).catch(function(err){
				res.send(err);
			});
		}).catch(function(err){
			console.log(err);
			res.send(err);
		});
	}).catch(function(err){
		res.send(err);
	});
});

router.get("/location/photo/:GUID", function(req, res){
	models.LocationImage.find({
		where:{
			LocationImageGUID: req.params.GUID
		},
		raw: true
	}).then(function(locationimage){
		fs.readFile(config.images.storage + locationimage.LocationID + "/" + req.params.GUID, function(err, buffer){
			if(err) res.send(err);
			else{
				res.contentType(locationimage.LocationImageContentType);
				res.send(buffer);
			}
		});		
	}).catch(function(err){
		res.send(err);
	});
});

router.get("/location/photo/:GUID/thumbnail", function(req, res){
	models.LocationImage.find({
		where:{
			LocationImageGUID: req.params.GUID
		},
		raw: true
	}).then(function(locationimage){
		fs.readFile(config.images.storage + locationimage.LocationID + "/thumbnail/" + req.params.GUID, function(err, buffer){
			if(err) res.send(err);
			else{
				res.contentType(locationimage.LocationImageContentType);
				res.send(buffer);
			}
		});		
	}).catch(function(err){
		res.send(err);
	});
});

router.get("/location/photo/:GUID/preview", function(req, res){
	models.LocationImage.find({
		where:{
			LocationImageGUID: req.params.GUID
		},
		raw: true
	}).then(function(locationimage){
		fs.readFile(config.images.storage + locationimage.LocationID + "/preview/" + req.params.GUID, function(err, buffer){
			if(err) res.send(err);
			else{
				res.contentType(locationimage.LocationImageContentType);
				res.send(buffer);
			}
		});		
	}).catch(function(err){
		res.send(err);
	});
});

router.get("/location/photo/:GUID/info", function(req, res){
	models.LocationImage.find({
		where:{
			LocationImageGUID: req.params.GUID
		},
		raw: true,
		attributes: ["UserID","createdAt"],
		include: [{
			model: models.User,
			where: {
				UserID: Sequelize.col("User.UserID")
			},
			attributes: ["UserCity", "UserState", "UserName"]
		}]
	}).then(function(locationimage){
		res.send(locationimage);
	}).catch(function(err){
		res.send(err);
	});
});

router.post("/location/photo", upload.single("file"), function(req, res){
	if(req.cookies.User){
		models.LocationImage.create({
			UserID: req.cookies.User.UserID,
			LocationID: req.headers.referer.split("/")[4],
			LocationImageContentType: req.file.mimetype
		}).then(function(locationimage){
			if(!fs.existsSync(config.images.storage + req.headers.referer.split("/")[4])){
				fs.mkdirSync(config.images.storage + req.headers.referer.split("/")[4]);
				fs.mkdirSync(config.images.storage + req.headers.referer.split("/")[4] + "/thumbnail");
				fs.mkdirSync(config.images.storage + req.headers.referer.split("/")[4] + "/preview");
			}
			async.parallel([
				function(callback){
					lwip.open(req.file.buffer, mime.extension(req.file.mimetype), function(err, image){
						if(err) return callback(err);
						image.scale(0.10, function(err, image){
							if(err) return callback(err);
							image.toBuffer(mime.extension(req.file.mimetype), function(err, buffer){
								if(err) return callback(err);
								fs.writeFileSync(config.images.storage + req.headers.referer.split("/")[4] + "/thumbnail/" + locationimage.LocationImageGUID, buffer);
								callback(null, null);
							});
						});
					});
				},
				function(callback){
					lwip.open(req.file.buffer, mime.extension(req.file.mimetype), function(err, image){
						if(err) return callback(err);
						image.scale(0.25, function(err, image){
							if(err) return callback(err);
							image.toBuffer(mime.extension(req.file.mimetype), function(err, buffer){
								if(err) return callback(err);
								fs.writeFileSync(config.images.storage + req.headers.referer.split("/")[4] + "/preview/" + locationimage.LocationImageGUID, buffer);
								callback(null, null);
							});
						});
					});
				},
				function(callback){
					fs.writeFileSync(config.images.storage + req.headers.referer.split("/")[4] + "/" + locationimage.LocationImageGUID, req.file.buffer);
					callback(null, null);
				}
			], function(err, results){
				if(err) res.send(err);
				else res.send("success");
			});		
		}).catch(function(err){
			res.send(err);
		});
	}
	else{
		res.send("failure");
	}
});

router.get("/user/:id", function(req, res){
	models.User.find({
		where:{
			UserID: req.params.id
		},
		raw: true,
		attributes:["UserCity","UserState","UserName","createdAt"]
	}).then(function(user){
		models.Review.findAll({
			where:{
				UserID: req.params.id
			},
			order: "createdAt DESC",
			attributes: ["ReviewRating","ReviewText","createdAt","LocationID"],
			raw: true
		}).then(function(reviews){
			models.Location.findAll({
				where:{
					LocationID: {
						$in: lodash.map(reviews, "LocationID")
					}
				},
				raw: true,
				attributes:["LocationName","LocationID"]
			}).then(function(locations){
				lodash.forEach(reviews, function(r){
					r.LocationName = lodash.find(locations, {
						LocationID: r.LocationID
					}).LocationName;
				});
				res.render("user", {
					cookie: req.cookies.User,
					user: user,
					reviews: reviews
				});
			}).catch(function(err){
				res.send(err);
			});
		}).catch(function(err){
			res.send(err);
		});	
	}).catch(function(err){
		res.send(err);
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
		geocoder.geocode(req.body.LocationAddress + " " + req.body.LocationCity + ", " + req.body.LocationState).then(function(geo) {
			models.Location.create({
				LocationName: req.body.LocationName,
				LocationAddress: req.body.LocationAddress,
				LocationCity: req.body.LocationCity,
				LocationState: req.body.LocationState,
				CreatedByUserID: req.cookies.User.UserID,
				LocationTypeID: req.body.LocationTypeID,
				PriceLevelID: req.body.PriceLevelID,
				EnvironmentTypeID: req.body.EnvironmentTypeID,
				LocationLongitude: geo[0].longitude,
				LocationLatitude: geo[0].latitude
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
						res.send(err);
					});
				}).catch(function(err){
					res.send(err);
				});
			}).catch(function(err){
				res.send(err);
			});
		}).catch(function(err) {
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
			res.send(lodash.uniq(lodash.map(flavors, "dataValues.LocationFlavor")));
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
		UserFullName: req.body.UserFullName,
		UserCity: req.body.UserCity,
		UserState: req.body.UserState,
		UserName: req.body.UserName
	}).then(function(user){
		transporter.sendMail({
			from: "no-reply@thetopcorn.com",
			to: req.body.UserEmail,
			subject: "Welcome to The Top Corn",
			html: "Thanks for signing up!"
		}, function(err, info){
			if(err) console.log(err);
			else console.log(info);
			res.send("success");
		});
	}).catch(function(err){
		res.send(err);
	});
});

router.get("/login", function(req, res){
	if(req.cookies.User){
		res.redirect("/");
	}
	else{
		res.render("login");
	}
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
	 				UserCity: user.UserCity,
	 				UserState: user.UserState,
	 			}, {
	 				expires: new Date(Date.now() + 14400000)
	 			});
	 			models.UserLoginLog.create({
	 				UserID: user.UserID,
	 				UserLoginLogIP: req.ip
	 			}).then(function(createduserloginlog){
	 				req.query.i === "page" ? res.redirect("/") : res.send(true);
	 			}).catch(function(err){
	 				res.send(err);
	 			});	 			
	 		}
	 		else{
	 			req.query.i === "page" ? res.redirect("/login#failure") : res.send(false);
	 		}
 		}
 		else{
 			req.query.i === "page" ? res.redirect("/login#failure") : res.send(false);
 		}
 	}).catch(function(err){
 		res.send(err);
 	});
});

router.get("/logout", function(req, res){
	res.clearCookie("User");
	res.redirect(req.header("Referer"));
});

router.get("/location/:id/add-review", function(req, res){
	if(req.cookies.User){
		res.render("new-review", {
			cookie: req.cookies.User,
			locationid: req.params.id
		});
	}
	else{
		res.redirect("/login");
	}
});

router.post("/location/:id/add-review", function(req, res){
	if(req.cookies.User){
		models.Review.create({
			ReviewRating: req.body.ReviewRating,
			ReviewText: req.body.ReviewText,
			LocationID: req.params.id,
			UserID: req.cookies.User.UserID,
		}).then(function(newreview){
			res.send({
				status: true,
				locationid: req.params.id
			});
		}).catch(function(err){
			res.send(err);
		});
	}
	else{
		res.redirect("/login");
	}
});

router.get("/search-attributes", function(req, res){
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
		}
	}, function(err, results){
		if(err) res.send(err);
		res.send(results);
	});
});

router.post("/forgot-password-step-1", function(req, res){
	models.User.find({
		where: {
	 		UserEmail: req.body.UserEmail,
	 		deletedAt: null
 		}
 	}).then(function(user){
 		if(user){
 			var chance = new Chance();
			var rando = chance.string({
				length: 10,
				pool: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			});
	 		models.User.update({
	 			UserPassword: bcrypt.hashSync(rando, bcrypt.genSaltSync(10)),
	 		},{
	 			where:{
	 				UserID: user.UserID
	 			}
	 		}).then(function(updateduser){
				transporter.sendMail({
					from: "no-reply@thetopcorn.com",
					to: req.body.UserEmail,
					subject: "Password Has Been Reset",
					html: "Your password has been reset to: <br><br><b>" & rando & "</b>"
				}, function(err, info){
					if(err) console.log(err);
					else console.log(info);
					res.send(true);
				});
	 		}).catch(function(err){
	 			res.send(err);
	 		});
 		}
 		else{
 			res.send(true);
 		}
 	}).catch(function(err){
 		res.send(err);
 	});
});

module.exports = router;