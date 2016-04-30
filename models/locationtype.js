module.exports = function(sequelize, DataTypes){
	var LocationType = sequelize.define("LocationType", {
		LocationTypeID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		LocationType: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		freezeTableName: true,
		paranoid: true
	});
	return LocationType;
};