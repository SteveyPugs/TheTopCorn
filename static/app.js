var app = angular.module("Pop", ["ui.bootstrap", "ngMap", "ngFileUpload"]).filter("range", function(){
	return function(input, total){
		total = parseInt(total);
		for (var i=0; i<total; i++){
			input.push(i);
		}
		return input;
	};
});