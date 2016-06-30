var config = require("../config");
var Sequelize = require("sequelize");
var async = require("async");
var sequelize = new Sequelize(config.database.database, config.database.username, config.database.password, {
	host: config.database.host,
	dialect: "mysql",
	logging: false
});

var models = [{
	name: "User",
	file: "user"
},{
	name: "Location",
	file: "location"
},{
	name: "EnvironmentType",
	file: "environmenttype"
},{
	name: "LocationType",
	file: "locationtype"
},{
	name: "PriceLevel",
	file: "pricelevel"
},{
	name: "Review",
	file: "review"
},{
	name: "LocationFlavor",
	file: "locationflavor"
},{
	name: "LocationImage",
	file: "locationimage"
}];

models.forEach(function(model) {
	module.exports[model.name] = sequelize.import(__dirname + '/' + model.file);
});

sequelize.authenticate().then(function(err){
	if(err) console.log(err);
	(function(model){
		model.Location.belongsTo(model.EnvironmentType, {
			foreignKey: "EnvironmentTypeID"
		});
		model.Location.belongsTo(model.LocationType, {
			foreignKey: "LocationTypeID"
		});
		model.Location.belongsTo(model.PriceLevel, {
			foreignKey: "PriceLevelID"
		});
		model.Review.belongsTo(model.User, {
			foreignKey: "UserID"
		});
		model.Review.belongsTo(model.Location, {
			foreignKey: "LocationID"
		});
		model.LocationFlavor.belongsTo(model.Location, {
			foreignKey: "LocationID"
		});
		model.LocationImage.belongsTo(model.User, {
			foreignKey: "UserID"
		});
		model.LocationImage.belongsTo(model.Location, {
			foreignKey: "LocationID"
		});
		sequelize.sync({
			force: false
		}).then(function(){
			async.parallel({
				environmenttypes: function(callback){
					model.EnvironmentType.count().then(function(c){
						if(c === 0){
							model.EnvironmentType.bulkCreate([{
								EnvironmentType: "Adult"
							},{
								EnvironmentType: "Child Friendly"
							},{
								EnvironmentType: "All Ages"
							}]).then(function(environmenttypes){
								console.log("Environment Types added");
								callback(null, null);
							}).catch(function(err){
								callback(err, null);
							});
						}
						else{
							callback(null, null);
						}
					});
				},
				locationtypes: function(callback){
					model.LocationType.count().then(function(c){
						if(c === 0){
							model.LocationType.bulkCreate([{
								LocationType: "Stadium"
							},{
								LocationType: "Vendor (Street or Truck)"
							},{
								LocationType: "Amusement Park"
							},{
								LocationType: "Beach / Boardwalk"
							},{
								LocationType: "Specialty Shop"
							},{
								LocationType: "Movie Theater"
							}]).then(function(locationtypes){
								console.log("Location Types added");
								callback(null, null);
							}).catch(function(err){
								callback(err, null);
							});
						}
						else{
							callback(null, null);
						}
					});
				},
				pricelevels: function(callback){
					model.PriceLevel.count().then(function(c){
						if(c === 0){
							model.PriceLevel.bulkCreate([{
								PriceLevel: "$"
							},{
								PriceLevel: "$$"
							},{
								PriceLevel: "$$$"
							},{
								PriceLevel: "$$$$"
							}]).then(function(pricelevels){
								console.log("Price Levels added");
								callback(null, null);
							}).catch(function(err){
								callback(err, null);
							});
						}
						else{
							callback(null, null);
						}
					});
				}
			}, function(err, results){
				if(err) console.log(err);
				else console.log("sync complete");
			});
		}).catch(function(err){
			console.log(err);
		});
	})(module.exports);
}).catch(function(err){
	console.log(err);
});
