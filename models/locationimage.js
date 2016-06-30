module.exports = function(sequelize, DataTypes){
	var LocationImage = sequelize.define("LocationImage", {
		LocationImageID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		LocationImageGUID: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4
		},
		LocationImageContentType: {
			type: DataTypes.STRING
		}
	}, {
		freezeTableName: true,
		paranoid: true
	});
	return LocationImage;
};