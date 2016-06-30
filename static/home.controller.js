app.controller("Home", function($scope, $http, $window, $location, $interval, $httpParamSerializer){
	$http.get("/search-attributes").then(function(response){
		$scope.environmenttypes = response.data.environmenttypes;
		$scope.locationtypes = response.data.locationtypes;
	}).catch(function(err){
		console.log(err);
	});
	$scope.search = {};
	$scope.getLocations = function(){
		$http.get("/locations?" + $httpParamSerializer($scope.search)).then(function(response){
			$scope.locations = response.data;
		}).catch(function(err){
			console.log(err);
		});
	};
	$scope.search.c = {
		"1": true,
		"2": true,
		"3": true,
		"4": true
	};
	$scope.search.o = 0;
	$scope.search.d = 5;
	$scope.$watchCollection("search.c", function(){
		var counter = 0;
		for(var r in $scope.search.c){
			if($scope.search.c[r]){
				counter = counter + 1;	
			}
		}
		if(counter === 0){
			$scope.search.c = {
				"1": true,
				"2": true,
				"3": true,
				"4": true
			};
		}
		$scope.getLocations();
	});
	$scope.$watchCollection("search.d", function(){
		$scope.getLocations();
	});
	$scope.$watchCollection("search.et", function(){
		$scope.getLocations();
	});
	$scope.$watchCollection("search.lt", function(){
		$scope.getLocations();
	});
	$scope.go = function(v){
		$scope.search.o = $scope.search.o + v;
		$scope.getLocations();
	};
});