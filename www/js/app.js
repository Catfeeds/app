var app = angular.module('myApp', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('tabs', {
                url: '/app',
                controller: 'AppCtrl',
                templateUrl: function() {
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
            .state('intro', {
                url: '/',
                templateUrl: 'templates/intro.html',
                controller: 'IntroCtrl'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'AuthCtrl'
            });

        $urlRouterProvider.otherwise('/');
    })
    .run(['$rootScope', '$state', function($rootScope, $state) {
        var authorized = localStorage.authorized,
            inited = localStorage.inited;

        if (!authorized && inited) {
            return $state.go('login');
        } else if (inited){
            return $state.go('tabs.home');
        }

        // 设置跳转
        $rootScope.$on('$stateChangeStart', function(){
            console.log('test');
        });
    }]);

app
    .controller('AppCtrl', function($scope, $ionicSideMenuDelegate, $ionicTabsDelegate) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.changeTab = function(index) {
            console.log('tab: ', index);
            $ionicTabsDelegate.$getByHandle('tabs').select(index);
        }
    })
    .controller('HomeTabCtrl', function($scope, $ionicSideMenuDelegate) {

    }).controller('AboutCtrl', function($scope, $ionicSideMenuDelegate) {

    })
    .controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
        // Called to navigate to the main app
        $scope.startApp = function() {
            // 检查登录
            localStorage.inited = true;
            // disable backbutton
            
            if (localStorage.authorized) {
                $state.go('tabs.home');
            }else{
                $state.go('login');
            };
        };

        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };
    })
    .controller('AuthCtrl', ['$scope', '$state', function ($scope, $state) {
        $scope.login = function(){
            // disable backbutton
            $state.go('tabs.home');
        }
    }]);
