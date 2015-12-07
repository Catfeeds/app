var app = angular.module('gugecc', [
    'ionic', 
    'ui.router',
    'gugecc.services',
    'oc.lazyLoad',
    'ngCookies'
]);

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
                controller: 'AuthCtrl',
                resolve : {
                    deps : ['$ocLazyLoad', function($ocLazyLoad){
                        return $ocLazyLoad.load('lib/angular-md5/angular-md5.js');
                    }]
                }
            });

        $urlRouterProvider.otherwise('/');
    })
    .run(['$rootScope', '$state', 'cookies', function($rootScope, $state, cookies) {
        var inited = localStorage.inited;
        // 设置跳转
        
        $rootScope.$on('$stateChangeStart',  function(event, toState, toParams, fromState, fromParams){ 
            // event.preventDefault(); 
            // transitionTo() promise will be rejected with 
            // a 'transition prevented' error
            console.log(event, localStorage);
        })
    }]);

app
    .controller('AppCtrl', function($scope, $ionicSideMenuDelegate, $ionicTabsDelegate, $api) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.changeTab = function(index) {
            console.log('tab: ', index);
            $ionicTabsDelegate.$getByHandle('tabs').select(index);
        }

        $scope.logout = function(){
            $api.auth.logout(null, function(res){
                console.log('logout: ', res);
            })
        }
    })
    .controller('HomeTabCtrl', function($scope, $ionicSideMenuDelegate) {

    }).controller('AboutCtrl', function($scope, $ionicSideMenuDelegate) {

    })
    .controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, cookies) {
        // Called to navigate to the main app
        $scope.startApp = function() {
            // 检查登录
            localStorage.inited = true;
            // disable backbutton
            
            if (cookies.valid()) {
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
    .controller('AuthCtrl', ['$scope', '$state', '$api', 'md5', function ($scope, $state, $api, md5) {
        $scope.user = {};

        $scope.login = function(){
            var credential = {
                user: $scope.user.user,
                passwd: md5.createHash($scope.user.password).toUpperCase()
            }
                
            // disable backbutton
            console.log($api, $scope.user);
            // $state.go('tabs.home');
            $api.auth.login(credential, function(res){
                if(!res.code){
                    
                    $state.go('tabs.home');
                }else{
                    alert('登录失败');
                }
                console.log('res: ', res);
            });
        }
    }]);
