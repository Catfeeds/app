var app = angular.module('gugecc', [
    'ionic', 
    'ui.router',
    'gugecc.services',
    'gugecc.controllers',
    'oc.lazyLoad',
    'ngCookies'
]);

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $ionicConfigProvider.platform.android.tabs.position("bottom");
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');

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
                        templateUrl: 'templates/home.html',
                        controller: 'HomeTabCtrl'
                    }
                },
                resolve : {
                    deps : function($ocLazyLoad){
                        return $ocLazyLoad.load([{
                            'files' : ['./lib/moment/moment.js']
                        }]);
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
            })
            .state('logout', {
                url: '/logout',
                controller: function($scope, cookies, $state) {
                    cookies.down();
                    $state.go('login');
                }
            });

        $urlRouterProvider.otherwise('/');
    })
    .run(['$rootScope', '$state', 'cookies', function($rootScope, $state, cookies) {
        // 设置跳转
        
        $rootScope.$on('$stateChangeStart',  function(event, toState, toParams, fromState, fromParams){ 
            var inited = localStorage.inited;
            if (inited && toState.name == 'intro') {
                event.preventDefault(); 
                $state.go('login');
            };
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
    .controller('AuthCtrl', ['$scope', '$state', '$api', 'md5', 'cookies', function ($scope, $state, $api, md5, cookies) {
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
                    // setup cookie
                    cookies.up(res.result);
                    $state.go('tabs.home');
                }else{
                    alert('登录失败');
                }
                console.log('res: ', res);
            });
        }
    }]);
