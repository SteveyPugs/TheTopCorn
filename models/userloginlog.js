module.exports = function(sequelize, DataTypes){
	var UserLoginLog = sequelize.define("UserLoginLog", {
		UserLoginLogID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		UserLoginLogIP: {
			type: DataTypes.STRING,
			allowNull: false
		}
	}, {
		freezeTableName: true,
		paranoid: true
	});
	return UserLoginLog;
};