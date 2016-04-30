module.exports = function(sequelize, DataTypes){
	var PriceLevel = sequelize.define("PriceLevel", {
		PriceLevelID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		PriceLevel: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		freezeTableName: true,
		paranoid: true
	});
	return PriceLevel;
};