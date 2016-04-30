module.exports = function(sequelize, DataTypes){
	var Review = sequelize.define("Review", {
		ReviewID: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		ReviewRating: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		ReviewText: {
			type: DataTypes.STRING(4000),
			allowNull: false
		}
	}, {
		freezeTableName: true,
		paranoid: true
	});
	return Review;
};