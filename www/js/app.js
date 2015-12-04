var app = angular.module('myApp', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('tabs', {
            url: '/app',
            controller: 'AppCtrl',
            templateUrl: function(){
                return 'templates/tabs.html';
            },
            abstract: true
        })
        .state('tabs.home', {
            url: '/home',
            views: {
                'home-tab': {
                    templateUrl: 'templates/home.html'
                }
            }
        })
        .state('tabs.analyze', {
            url: '/analyze',
            views: {
                'analyze-tab': {
                    templateUrl: 'templates/analyze.html'
                }
            }
        })
        .state('tabs.device', {
            url: '/device',
            views: {
                'device-tab': {
                    controller: 'AboutCtrl',
                    templateUrl: 'templates/device.html'
                }
            }
        })
        .state('tabs.charge', {
            url: '/charge',
            views: {
                'charge-tab': {
                    controller: 'AboutCtrl',
                    templateUrl: 'templates/charge.html'
                }
            }
        })
        .state('login', {
            url : '/login',
            templateUrl: 'templates/login.html'
        });

    $urlRouterProvider.otherwise('/login');
})
.run(['$rootScope', '$state', function ($rootScope, $state) {
    var authorized = localStorage.authorized;

    if (!authorized) {
        $state.go('login');
    }else{
        $state.go('tabs.home')
    };
}]);

app
	.controller('AppCtrl', function($scope, $ionicSideMenuDelegate, $ionicTabsDelegate) {
	    $scope.toggleLeft = function() {
	        $ionicSideMenuDelegate.toggleLeft();
	    };

	    $scope.changeTab = function(index){
	    	console.log('tab: ', index);
	    	$ionicTabsDelegate.$getByHandle('tabs').select(index);
	    }
	})
	.controller('HomeTabCtrl', function($scope, $ionicSideMenuDelegate) {

	}).controller('AboutCtrl', function($scope, $ionicSideMenuDelegate) {
  
	});
