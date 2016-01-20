var app = angular.module('gugecc', [
    'ionic',
    'ui.router',
    'gugecc.services',
    'gugecc.filters',
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

        /* 隐藏文字 */
        $ionicConfigProvider.backButton.text('');
        $ionicConfigProvider.backButton.previousTitleText('');

        $stateProvider
            .state('tabs', {
                url: '/m',
                views: {
                    "root": {
                        controller: 'AppCtrl',
                        templateUrl: 'templates/sidemenu.html'
                    }
                },
                resolve: {
                    deps: function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lib/moment/moment.js'
                        ]);
                    },
                    'Me': function($api, $q, $cookies) {
                        var defer = $q.defer();
                        $api.account.userinfo({
                            uid: $cookies.get('user')
                        }, function(res) {
                            return defer.resolve(res.result);
                        });
                        return defer.promise;
                    }
                },
                abstract: true
            })
            .state('tabs.tab', {
                abstract: true,
                views: {
                    'tabs': {
                        templateUrl: 'templates/tabs.html'
                    }
                },
                resolve : {}
            })
            .state('tabs.tab.home', {
                url: '/home',
                views: {
                    'home-tab': {
                        templateUrl: 'templates/home.html',
                        controller: 'HomeTabCtrl'
                    }
                },
                resolve: {
                    'Account': function(Me) {
                        return Me;
                    }
                }
            })
            .state('tabs.tab.analyze', {
                url: '/analyze',
                views: {
                    'analyze-tab': {
                        templateUrl: 'templates/analyze.html',
                        controller: 'Analyze'
                    }
                },
                resolve: {
                    deps: function($ocLazyLoad, $injector, $q) {
                        return $ocLazyLoad.load([{
                            serie: true,
                            files: [
                                './lib/Chart.js/Chart.js',
                                './lib/Chart.StackedBar.js/src/Chart.StackedBar.js',
                                './lib/angular-chart.js/dist/angular-chart.css',
                                './lib/angular-chart.js/dist/angular-chart.js',
                                './js/directives.js'
                            ]
                        }]).then(function(chart) {
                            var provider = $injector.get("ChartJs");
                            provider.Chart.defaults.StackedBar.barShowStroke = false;
                            // provider.Chart.defaults.StackedBar.barValueSpacing = 15;
                            provider.Chart.defaults.StackedBar.showTooltips = false;

                        });
                    }
                }
            })
            .state('tabs.tab.analyze_detail', {
                url: '/analyze_detail/:type/',
                views: {
                    'analyze-tab': {
                        controller: 'Analyze',
                        templateUrl: 'templates/analyze/detail.html'
                    }
                }
            })
            .state('tabs.tab.device', {
                url: '/device',
                views: {
                    'device-tab': {
                        controller: 'Device',
                        templateUrl: 'templates/device.html'
                    }
                }
            })
            .state('tabs.tab.device_control', {
                url: '/control/:type?',
                views: {
                    'device-tab': {
                        templateUrl: 'templates/device/control.html'
                    }
                }
            })
            .state('tabs.tab.charge', {
                url: '/charge',
                views: {
                    'charge-tab': {
                        controller: 'Charge',
                        templateUrl: 'templates/charge.html'
                    }
                }
            })
            .state('tabs.tab.logs', {
                url: '/log',
                views: {
                    'charge-tab': {
                        controller: 'LogCtrl',
                        templateUrl: 'templates/charge/logs.html'
                    }
                }
            })
            .state('intro', {
                url: '/',
                views: {
                    'root': {
                        templateUrl: 'templates/intro.html',
                        controller: 'IntroCtrl'
                    }
                }
            })
            .state('notices', {
                'url': '/notices',
                'views': {
                    'root': {
                        templateUrl: 'templates/notices.html'
                    }
                }
            })
            .state('feedback', {
                'url': '/feedback',
                'views': {
                    'root': {
                        templateUrl: 'templates/feedback.html'
                    }
                }
            })
            .state('settings', {
                'url': '/settings',
                'views': {
                    'root': {
                        templateUrl: 'templates/settings.html'
                    }
                }
            })
            .state('login', {
                url: '/login',
                views: {
                    'root': {
                        templateUrl: 'templates/login.html',
                        controller: 'AuthCtrl'
                    }
                },
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lib/moment/moment.js',
                            'lib/angular-md5/angular-md5.js'
                        ]);
                    }]
                }
            })
            .state('logout', {
                url: '/logout',
                cache: false,
                resolve: {
                    deps: function(cookies, $api, $q) {
                        var defer = $q.defer();
                        $api.auth.logout(null, function(res) {
                            cookies.down();
                            defer.resolve();
                        });
                        return defer.promise;
                    }
                },
                controller: function($scope, $state, deps) {
                    $state.go('login');
                }
            });

        $urlRouterProvider.otherwise('/');
    })
    .config(function($httpProvider) {
        $httpProvider.interceptors.push(function($rootScope) {
            return {
                request: function(config) {
                    $rootScope.$broadcast('loading:show');
                    return config;
                },
                response: function(response) {
                    $rootScope.$broadcast('loading:hide');
                    return response;
                },
                responseError: function(response){
                    $rootScope.$broadcast('loading:hide', {'type': 'error'});
                    return response
                }
            }
        })
    })
    .run(['urls', '$cookies', 'encrypt', '$http', '$ionicLoading', '$rootScope', function(urls, $cookies, encrypt, $http, $ionicLoading, $rootScope) {
        if (!urls.debug) {
            $http.defaults.transformRequest.push(function(data, headerGetter) {
                var obj = encrypt($cookies.get('user'), $cookies.get('token'), data ? JSON.parse(data) : data);
                return obj ? JSON.stringify(obj) : obj;
            });
        };

        $rootScope.$on('loading:show', function() {
            $ionicLoading.show({
                template: '<ion-spinner icon="lines"></ion-spinner>',
                hideOnStateChange: true
            })
        })

        $rootScope.$on('loading:hide', function(state, data) {
            if (data && data.type == 'error') {
                return $ionicLoading.show({
                    template: '服务器错误',
                    duration: 2000
                });
            };
            $ionicLoading.hide();
        })
    }])
    .run(['$rootScope', '$state', 'cookies', function($rootScope, $state, cookies) {
        // 设置跳转
        var cookies = cookies;
        $rootScope.$on('$stateChangeStart', function(event,
            toState, toParams, fromState, fromParams) {
            var inited = localStorage.inited;
            if (!inited && toState.name == 'intro') {
                return;
            }
            if ((inited && toState.name == 'intro') || (toState.name != 'login' && !cookies.valid())) {
                event.preventDefault();
                $state.go('login');
            };

            if (cookies.valid() && toState.name == 'login') {
                event.preventDefault();
                $state.go('tabs.tab.home');
            };
        })
    }]);

app
    .controller('AppCtrl', function($scope,
        $ionicSideMenuDelegate,
        $ionicTabsDelegate,
        $api,
        $state) {

        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.changeTab = function(index) {
            $ionicTabsDelegate.$getByHandle('tabs').select(index);
        }

        $scope.logout = function() {
            $api.auth.logout(null, function(res) {
                $state.go('login');
            })
        }

        $scope.go = function(state) {
            $state.go(state);
            $ionicSideMenuDelegate.toggleLeft();
        }
    })
    .controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, cookies) {
        // Called to navigate to the main app
        $scope.startApp = function() {
            // 检查登录
            localStorage.inited = true;
            // disable backbutton

            if (cookies.valid()) {
                $state.go('tabs.tab.home');
            } else {
                $state.go('login');
            };
        };

        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };
    })
    .controller('AuthCtrl', ['$scope', '$state', '$api', 'md5', 'cookies', '$ionicHistory', function($scope, $state, $api, md5, cookies, $ionicHistory) {
        $scope.user = {};

        $scope.login = function() {
            var credential = {
                user: $scope.user.user,
                passwd: md5.createHash($scope.user.password).toUpperCase()
            }
            $api.auth.login(credential, function(res) {
                if (!res.code) {
                    // setup cookie
                    cookies.up(res.result);
                    $ionicHistory.clearCache()
                    $state.go('tabs.tab.home', {}, {
                        reload: true
                    });
                } else {
                    alert('登录失败');
                }
            });
        }
    }]);
