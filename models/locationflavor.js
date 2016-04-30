module.exports = function(sequelize, DataTypes){
	var LocationFlavor = sequelize.define("LocationFlavor", {
		LocationFlavorID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		LocationFlavor: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		freezeTableName: true,
		paranoid: true
	});
	return LocationFlavor;
};