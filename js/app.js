var app = angular.module('gugecc', [
    'ionic', 
    'ui.router',
    'gugecc.services',
    'gugecc.controllers',
    'oc.lazyLoad',
    'ngCookies'
]);

app.config(function($stateProvider, 
        $urlRouterProvider, 
        $ionicConfigProvider, 
        $ocLazyLoadProvider) {
        $ionicConfigProvider.platform.android.tabs.position("bottom");
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');

        $stateProvider
            .state('tabs', {
                url: '/app',
                controller: 'AppCtrl',
                templateUrl: function() {
                    return 'templates/tabs.html';
                },
                resolve : {
                    deps : function($ocLazyLoad){
                        return $ocLazyLoad.load([
                            'lib/moment/moment.js'
                        ]);
                    }
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
                }
            })
            .state('tabs.analyze', {
                url: '/analyze',
                views: {
                    'analyze-tab': {
                        templateUrl: 'templates/analyze.html',
                        controller: 'Analyze'
                    }
                },
                resolve : {
                    deps : function($ocLazyLoad, $injector, $q){
                        return $ocLazyLoad.load([{
                            serie : true,
                            files: [
                                './js/directives.js',
                                './lib/Chart.js/Chart.js',
                                './lib/Chart.StackedBar.js/src/Chart.StackedBar.js',
                                './lib/angular-chart.js/dist/angular-chart.css',
                                './lib/angular-chart.js/dist/angular-chart.js'
                            ]}
                        ]).then(function(chart){
                            var provider = $injector.get("ChartJs");
                            provider.Chart.defaults.StackedBar.barShowStroke = false;
                            provider.Chart.defaults.StackedBar.barValueSpacing = 18;
                            provider.Chart.defaults.StackedBar.showTooltips = false;
                            provider.Chart.defaults.global.colours = [
                                '#F7464A','#46BFBD', '#FDB45C'
                            ]; 
                        });
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
                        controller: 'Charge',
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
                        return $ocLazyLoad.load([
                            'lib/moment/moment.js',
                            'lib/angular-md5/angular-md5.js'
                        ]);
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
    .run(['urls', '$cookies', 'encrypt', '$http', function (urls, $cookies, encrypt, $http) {
        if (!urls.debug) {
            $http.defaults.transformRequest.push(function(data, headerGetter){
                var obj = encrypt($cookies.get('user'), $cookies.get('token'), data ? JSON.parse(data) : data);
                return obj ? JSON.stringify(obj) : obj;
            });
        };
    }])
    .run(['$rootScope', '$state', 'cookies', function($rootScope, $state, cookies) {
        // 设置跳转
        var cookies = cookies;
        $rootScope.$on('$stateChangeStart',  function(event, 
            toState, toParams, fromState, fromParams){ 
            var inited = localStorage.inited;
            if ((inited && toState.name == 'intro') || (toState.name != 'login' && !cookies.valid()) ) {
                event.preventDefault(); 
                $state.go('login');
            };

            if (cookies.valid() && toState.name == 'login') {
                event.preventDefault();
                $state.go('tabs.home');
            };
        })
    }]);

app
    .controller('AppCtrl', function($scope, $ionicSideMenuDelegate, $ionicTabsDelegate, $api) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.changeTab = function(index) {
            $ionicTabsDelegate.$getByHandle('tabs').select(index);

            // reload the page
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
                    $state.go('tabs.home', null, {reload: true});
                }else{
                    alert('登录失败');
                }
                console.log('res: ', res);
            });
        }
    }]);
