angular.module('gugecc.diretives', ['chart.js'])
	.directive('chartStackedBar', ['ChartJsFactory', function (ChartJsFactory) { 
		return new ChartJsFactory('StackedBar'); 
	}])
	.directive('ionPinpadNum', ['$timeout', function ($timeout) {
		return {
			restrict: 'A',
			require: '^ngModel',
			link: function (scope, elm, attr, ctrl) {
				function getLastEmptyInput (current){
					var prev = current.previousSibling
					if (!prev || prev.value) {
						return current;
					} 

					return getLastEmptyInput(prev);
				}

				// 移动到下一个输入框
				function moveToNext (current, reverse){
					var next = reverse ? current.previousSibling : current.nextSibling;
					if (next) {
						last = next; next.focus();
					}
				}

				// focus 第一个空的
				elm.on('click', function focus (evt){
					var target = getLastEmptyInput(evt.target);
					if (evt.target == target) {
						return false;
					}
					
					window.setTimeout(function(){target.focus();}, 300);
				});

				elm.on('keypress', function keypress (evt){
					console.log(evt.keyCode);
					evt.returnValue = !!/[\d]/.exec(String.fromCharCode(evt.keyCode)) && !this.value;
				})

				// 保存输入
				elm.on('keyup', function keyup (evt){
					var val = '',
						inputs = angular.element(this).parent().find('input');
					
						angular.forEach(inputs, function(node, key){
							val += node.value
						});

					$timeout(function(){
						ctrl.$modelValue = val && ctrl.$setViewValue(val);
					});
					if (evt.keyCode == 8 || evt.keyCode == 46) {
						return moveToNext(this, !!1);
					}
					// 可以不用判断
					moveToNext(this);
				});
			}
		};
	}])
	.directive('ionPinpad', [function () {
		var input = '<input type="password" ion-pinpad-num class="ion-pin-pad-num" ',
			html = Array.apply(null, Array(6)).map(function(item, index){
				return input + 'data-num="'+index+'" />'
			}).join('');

		return {
			restrict: 'EA',
			require: 'ngModel',
			template: html,
			link: function(scope, elm){
				elm.find('input:first').focus();
			}
		};
	}]);