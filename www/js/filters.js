angular.module('gugecc.filters', [])
	.filter('unix', function(){
		return function(input, type){
			var format = type == 'DAY' ? 'HH:ss' : 'YYYY-MM-DD';
			return moment(input/1000, 'X').format(format);
		}
	})
	.filter('sum', function(){
		return function(input){
			var sum = 0;
			_.each(input, function(v){sum+=v;});
			return sum;
		}
	})