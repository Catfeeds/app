angular.module('gugecc.diretives', ['chart.js'])
	.directive('chartStackedBar', ['ChartJsFactory', function (ChartJsFactory) { 
		return new ChartJsFactory('StackedBar'); 
	}])
	.directive('ionPinpad', [function () {
		var input = '<input type="password" class="ion-pin-pad-num" />',
			html = Array.apply(null, Array(6)).map(function(){return input}).join('');

		return {
			restrict: 'EA',
			scope: {
				ngModel: '='
			},
			template: html,
			link: function (scope, elm, attr) {
				console.log('elm:', elm);
			}
		};
	}]);