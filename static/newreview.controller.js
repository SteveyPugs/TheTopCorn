app.controller("NewReview", function($scope, $http, $window, $location, $interval){
	$scope.addReview = function(){
		$http.post(window.location.pathname, {
			ReviewRating: $scope.LocationRating,
			ReviewText: $scope.LocationReview
		}).success(function(newreview){
			if(newreview.status){
				$window.location = "/location/" + newreview.locationid + "#new-review";
			}
		}).error(function(err){
		});
	};
});