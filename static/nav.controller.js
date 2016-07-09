app.controller("Nav", function($scope, $uibModal, $http, $window){
	$scope.register = function(size){
		var registerModal = $uibModal.open({
			animation: true,
			templateUrl: "/modals/register.html",
			controller: function($scope, $uibModalInstance){
				$scope.states = {
					"AL": "Alabama",
					"AK": "Alaska",
					"AZ": "Arizona",
					"AR": "Arkansas",
					"CA": "California",
					"CO": "Colorado",
					"CT": "Connecticut",
					"DE": "Delaware",
					"DC": "District Of Columbia",
					"FL": "Florida",
					"GA": "Georgia",
					"HI": "Hawaii",
					"ID": "Idaho",
					"IL": "Illinois",
					"IN": "Indiana",
					"IA": "Iowa",
					"KS": "Kansas",
					"KY": "Kentucky",
					"LA": "Louisiana",
					"ME": "Maine",
					"MD": "Maryland",
					"MA": "Massachusetts",
					"MI": "Michigan",
					"MN": "Minnesota",
					"MS": "Mississippi",
					"MO": "Missouri",
					"MT": "Montana",
					"NE": "Nebraska",
					"NV": "Nevada",
					"NH": "New Hampshire",
					"NJ": "New Jersey",
					"NM": "New Mexico",
					"NY": "New York",
					"NC": "North Carolina",
					"ND": "North Dakota",
					"OH": "Ohio",
					"OK": "Oklahoma",
					"OR": "Oregon",
					"PA": "Pennsylvania",
					"RI": "Rhode Island",
					"SC": "South Carolina",
					"SD": "South Dakota",
					"TN": "Tennessee",
					"TX": "Texas",
					"UT": "Utah",
					"VT": "Vermont",
					"VA": "Virginia",
					"WA": "Washington",
					"WV": "West Virginia",
					"WI": "Wisconsin",
					"WY": "Wyoming"
				};
				$scope.cancel = function(){$uibModalInstance.dismiss("cancel")};
				$scope.ok = function(){
					$http.post("/register", {
						UserEmail: $scope.NewEmailAddress,
						UserPassword: $scope.NewPassword,
						UserFullName: $scope.NewFullName,
						UserName: $scope.NewUserName,
						UserCity: $scope.NewCity,
						UserState: $scope.NewState
					}).success(function(data){
						$uibModalInstance.close();
					}).error(function(err){
					});
				};
			},
			size: size,
			resolve:{}
		});
	};
	$scope.login = function(size){
		var loginModal = $uibModal.open({
			animation: true,
			templateUrl: "/modals/login.html",
			controller: function($scope, $uibModalInstance){
				$scope.cancel = function(){$uibModalInstance.dismiss("cancel")};
				$scope.ok = function(){
					$http.post("/login", {
						UserEmail: $scope.UserEmail,
						UserPassword: $scope.UserPassword
					}).success(function(valid){
						if(valid){
							$window.location.reload();
						}
						else{
							$("#WrongEmailAndPassword").removeClass("hide");
						}
					}).error(function(err){
						console.log(err);
					});
				};
			},
			size: size
		});
	};
	$scope.forgot = function(size){
		var forgotModal = $uibModal.open({
			animation: true,
			templateUrl: "/modals/forgot.html",
			controller: function($scope, $uibModalInstance){
				$scope.cancel = function(){$uibModalInstance.dismiss("cancel")};
				$scope.ok = function(){
					$http.post("/forgot-password-step-1", {
						UserEmail: $scope.UserEmail
					}).success(function(valid){
						$uibModalInstance.dismiss("cancel");
					}).error(function(err){
						console.log(err);
					});
				};
			},
			size: size
		});
	};
	$scope.types = "['(cities)']";
});