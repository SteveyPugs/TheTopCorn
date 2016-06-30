app.controller("ViewLocation", function($scope, Upload, $location, $uibModal, $http){
	$scope.uploadPicture = function(file){
		Upload.upload({
			url: "/location/photo",
			data: {
				file: file
			}
		}).then(function(resp){
			if(resp.data === "failure"){
				$uibModal.open({
					templateUrl: "/modals/signin.html",
					size: "sm",
				});
			}
			else{
				location.reload();
			}
		}, function(err){
			console.log(err);
		});
	};
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