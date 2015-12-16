angular.module('gugecc.diretives', ['chart.js'])
	.directive('chartStackedBar', ['ChartJsFactory', function (ChartJsFactory) { return new ChartJsFactory('StackedBar'); }]);