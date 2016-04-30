app.controller("NewLocation", function($scope, $http, $window, $timeout, $interval){
	var flavors = $("#flavors").magicSuggest({
		data: "/flavors",
		placeholder: "Add your own flavors or choose from the list"
	});
	$scope.addLocation = function(){
		$http.post("/new-location", {
			LocationName: $scope.LocationName,
			LocationCity: $scope.LocationCity,
			LocationTypeID: $scope.LocationTypeID,
			PriceLevelID: $scope.PriceLevelID,
			LocationAddress: $scope.LocationAddress,
			LocationState: $scope.LocationState,
			EnvironmentTypeID: $scope.EnvironmentTypeID,
			ReviewRating: $scope.LocationRating,
			ReviewText: $scope.LocationReview,
			LocationFlavors: flavors.getValue()
		}).success(function(newlocation){
			if(newlocation === "success"){
				$window.location = "/#new-location-added";
			}
		}).error(function(err){
		});
	};
});