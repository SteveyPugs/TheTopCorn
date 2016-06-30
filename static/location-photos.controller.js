app.controller("ViewPhotos", function($scope, $uibModal, $http){
	$scope.open = function(guid){
		var modalInstance = $uibModal.open({
			templateUrl: "/modals/preview.html",
			controller: photoCtrl,
			size: "lg",
			resolve: {
				guid: function(){
					return guid;
				}
			}
		});
	};
	var photoCtrl = function ($scope, $uibModalInstance, guid){
		$scope.guid = guid;
		$http.get("/location/photo/" + guid + "/info").then(function(response){
			response.data.createdAt = moment(response.data.createdAt).format("MMMM Do YYYY");
			$scope.info = response.data;
		}).catch(function(err){
			console.log(err);
		});
	};
});