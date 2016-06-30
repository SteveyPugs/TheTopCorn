module.exports = function(sequelize, DataTypes){
	var Location = sequelize.define("Location", {
		LocationID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		LocationName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		LocationAddress: {
			type: DataTypes.STRING,
			allowNull: false
		},
		LocationCity: {
			type: DataTypes.STRING,
			allowNull: false
		},
		LocationState: {
			type: DataTypes.STRING,
			allowNull: false
		},
		CreatedByUserID: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		LocationLongitude: {
			type: DataTypes.FLOAT,
			allowNull: false
		},
		LocationLatitude: {
			type: DataTypes.FLOAT,
			allowNull: false
		}
	}, {
		freezeTableName: true,
		paranoid: true
	});
	return Location;
};