module.exports = function(sequelize, DataTypes){
	var EnvironmentType = sequelize.define("EnvironmentType", {
		EnvironmentTypeID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		EnvironmentType: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		freezeTableName: true,
		paranoid: true
	});
	return EnvironmentType;
};