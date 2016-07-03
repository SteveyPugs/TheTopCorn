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
	$scope.getLocation = function(){
		var geocoder = new google.maps.Geocoder();
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(function(position){
				var pos = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				var latlng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
				geocoder.geocode({
					"latLng": latlng
				}, function(results, status){
					if(status === google.maps.GeocoderStatus.OK){
						$scope.search.l = results[0].address_components[2].long_name + ", " + results[0].address_components[4].short_name;
						$scope.getLocations();
					}
				});
			}, function(){
				console.log(err);
			});
		}
		else{
			console.log(err);
		}
	}
	$scope.getLocation();
});