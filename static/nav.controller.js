app.controller("Nav", function($scope, $uibModal, $http, $window){
	$scope.register = function(size){
		var registerModal = $uibModal.open({
			animation: true,
			templateUrl: "/modals/register.html",
			controller: function($scope, $uibModalInstance){
				$scope.cancel = function(){$uibModalInstance.dismiss("cancel")};
				$scope.ok = function(){
					$http.post("/register", {
						UserEmail: $scope.NewEmailAddress,
						UserPassword: $scope.NewPassword,
						UserFullName: $scope.NewFullName
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
							console.log(valid);
						}
					}).error(function(err){
					});
				};
			},
			size: size,
			resolve:{}
		});
	};
});