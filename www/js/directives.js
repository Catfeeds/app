angular.module('gugecc.diretives', ['chart.js'])
	.directive('chartStackedBar', ['ChartJsFactory', function (ChartJsFactory) { 
		return new ChartJsFactory('StackedBar'); 
	}])
	.directive('ionPinpad', [function () {
		var input = '<span class="ion-pinpad-num" class="ion-pin-pad-num" ></span>',
			html = Array.apply(null, Array(6)).map(function(item, index){return input;}).join('');
			html = '<div class="ion-num-wrapper">' + html +'</div><input type="text" class="ion-pinpad-input" ng-model="num_input"/>'
		return {
			restrict: 'EA',
			require: 'ngModel',
			scope: {
				ngModel: '='
			},
			template: html,
			link: function(scope, elm, attr, ngModel){
				elm.find('input').on('keypress', function(evt){
					evt.returnValue = !!/[\d]/.exec(String.fromCharCode(evt.keyCode)) && this.value.length <6;
				})

				function syncText (text){
					var spans = elm.find('span'),
						len = spans.length;

					while(len--){
						spans[len].innerText = text ? text.charAt(len) : '';
					}
				}

				scope.$watch('num_input', function(n, o){
					if (n == o && !n) {
						return;
					}
					ngModel.$setViewValue(n);
					syncText(n);
				});
			}
		};
	}]);