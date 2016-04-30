module.exports = function(sequelize, DataTypes){
	var User = sequelize.define("User", {
		UserID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		UserEmail: {
			type: DataTypes.STRING,
			allowNull: false
		},
		UserPassword: {
			type: DataTypes.STRING,
			allowNull: false
		},
		UserCity: {
			type: DataTypes.STRING,
		},
		UserState: {
			type: DataTypes.STRING,
		},
		UserFullName: {
			type: DataTypes.STRING,
		}
	}, {
		freezeTableName: true,
		paranoid: true
	});
	return User;
};