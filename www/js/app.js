var app = angular.module('gugecc', [
    'ionic',
    'ui.router',
    'gugecc.services',
    'gugecc.filters',
    'gugecc.diretives',
    'gugecc.controllers',
    'oc.lazyLoad',
    'ngCookies',
    'ngCordova'
]);

app.config(function($stateProvider,
        $urlRouterProvider,
        $ionicConfigProvider,
        $ocLazyLoadProvider) {
        $ionicConfigProvider.platform.android.tabs.position("bottom");
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.positionPrimaryButtons('left');

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
                    'Me': function($api, $q, cookies, $rootScope) {
                        var defer = $q.defer();
                        $api.business.userinfo({
                            uid: cookies.get('user')
                        }, function(res) {
                            $rootScope._me = res.result;
                            return defer.resolve(res.result);
                        });
                        return defer.promise;
                    },
                    'info' : function($api, $q, cookies, $rootScope){
                        var defer = $q.defer();
                        $api.account.info({
                            id: cookies.get('user')
                        }, function(res){
                            $rootScope._userinfo = res.result;
                            return defer.resolve(res.result);
                        });
                        return defer.promise;
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
                },
                resolve: {
                    'Account': function(Me) {
                        return Me;
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
                resolve: {
                    deps: function($ocLazyLoad, $injector, $q) {
                        return $ocLazyLoad.load([{
                            serie: true,
                            files: [
                                './lib/Chart.StackedBar.js/src/Chart.StackedBar.js',
                                './lib/angular-chart.js/dist/angular-chart.css',
                                './lib/d3/d3.js',
                                './lib/ionic-datepicker/dist/ionic-datepicker.bundle.min.js'
                            ]
                        }]).then(function(chart) {
                            var provider = $injector.get("ChartJs");
                            provider.Chart.defaults.StackedBar.barShowStroke = false;
                            provider.Chart.defaults.StackedBar.showTooltips = false;
                        });
                    }
                }
            })
            .state('tabs.analyze_detail', {
                url: '/analyze_detail/:type/',
                params: {
                    time: null
                },
                views: {
                    'analyze-tab': {
                        controller: 'Analyze',
                        templateUrl: 'templates/analyze/detail.html'
                    }
                }
            })
            .state('tabs.device', {
                url: '/device',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lib/sha1.min.js/sha1.min.js'
                        ]);
                    }]
                },
                views: {
                    'device-tab': {
                        controller: 'Device',
                        templateUrl: 'templates/device.html'
                    }
                }
            })
            .state('tabs.device_control', {
                url: '/control/:id?',
                resolve: {
                    sensor: function($stateParams, $api, $q){
                        var defer = $q.defer();
                        $api.sensor.info({
                            sid: $stateParams.id,
                        }, function(res) {
                            if (res.code == 0) {
                                var sensor = res.result.detail && res.result.detail[0];
                                defer.resolve(sensor);
                            }else{
                                defer.reject({});
                            };
                        });

                        return defer.promise;
                    },
                    recent : function($api, $q, cookies, $stateParams){
                        var defer = $q.defer();

                        $api.business.timequantumstatistic({
                            deviceid: $stateParams.id
                        }, function(res){
                            console.log(res);
                            if (res.code == 0) {
                                defer.resolve(res.result);
                            }else{
                                defer.reject([]);
                            };
                        })
                        return defer.promise;
                    },
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'lib/sha1.min.js/sha1.min.js'
                        ]);
                    }]
                },
                views: {
                    'device-tab': {
                        templateUrl: 'templates/device/control.html',
                        controller: 'DeviceCtrl'
                    }
                }
            })
            .state('tabs.device_month', {
                url: '/month',
                params: {
                    'month': null,
                    'device': null
                },
                resolve: {
                    days: function($stateParams, $api, $q){
                        var m = $stateParams.month,
                            d = $stateParams.device,
                            defer = $q.defer();

                        $api.business.timequantumstatistic({
                            deviceid: d,
                            time: m.month
                        }, function(res){
                            if (res.code == 0) {
                                defer.resolve(res.result);
                            }else{
                                defer.reject([]);                               
                            }
                        })

                        return defer.promise;
                    },
                    deps: function($ocLazyLoad, $injector, $q) {
                        return $ocLazyLoad.load([{
                            serie: true,
                            files: [
                                './lib/Chart.js/Chart.js',
                                './lib/Chart.StackedBar.js/src/Chart.StackedBar.js',
                                './lib/angular-chart.js/dist/angular-chart.css',
                                './lib/angular-chart.js/dist/angular-chart.js',
                                './lib/d3/d3.js',
                                './js/directives.js'
                            ]
                        }]).then(function(chart) {
                            var provider = $injector.get("ChartJs");
                            provider.Chart.defaults.StackedBar.barShowStroke = false;
                            // provider.Chart.defaults.StackedBar.barValueSpacing = 15;
                            provider.Chart.defaults.StackedBar.showTooltips = false;

                        });
                    }
                },
                views: {
                    'device-tab' : {
                        templateUrl: 'templates/device/month.html',
                        controller: 'MonthCtrl'
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
                },
                resolve: {
                    channels: function($api, $q, Me){
                        var defer = $q.defer();
                        $api.payment.channelinfo({
                            project : Me.project,
                            flow: 'EARNING',
                            type: ['wx', 'alipay']
                        }, function(res){
                            return defer.resolve(res.result);
                        })
                        return defer.promise;
                    },
                    bankcards: function($api, $q, Me){
                        var defer = $q.defer();
                        $api.channelaccount.info({
                            belongto : Me.uid,
                            status: 'success'
                        }, function(res){
                            if (res.code == 0) {
                                return defer.resolve(res.result);
                            }else{
                                return defer.resolve([]);
                            }
                        })
                        return defer.promise;
                    }
                }
            })
            .state('tabs.logs', {
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
                        templateUrl: 'templates/notices.html',
                        controller: 'Notices'
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
            .state('bankcards', {
                url: '/bankcards',
                'views': {
                    'root': {
                        templateUrl: 'templates/settings/bankcards.html',
                        controller: 'BankCardSetting'
                    }
                }
            })
            .state('card', {
                url: '/card',
                params: {
                    card : null
                },
                'views': {
                    'root': {
                        templateUrl: 'templates/settings/card.html',
                        controller: 'CardDetail'
                    }
                }
            })
            .state('password', {
                url: '/password',
                'views': {
                    'root': {
                        templateUrl: 'templates/settings/password.html',
                        controller: 'Passwd'
                    }
                },
                resolve: {
                    account: function account ($api, $rootScope) {
                        return $rootScope._userinfo;
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
                            'lib/angular-md5/angular-md5.js'
                        ]);
                    }]
                }
            });

        $urlRouterProvider.otherwise('/m/home');
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
    .run(['urls', 'cookies', 'encrypt', '$http', '$ionicLoading', '$rootScope',
        function(urls, cookies, encrypt, $http, $ionicLoading, $rootScope) {
        // 设置请求超时 和 API 签名
        $http.defaults.timeout = 5000;
        if (!urls.debug) {
            $http.defaults.transformRequest.push(function(data, headerGetter) {
                var obj = encrypt(cookies.get('user'), cookies.get('token'), data ? JSON.parse(data) : data);
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
    .run(['$rootScope', '$state', 'notice', 'cookies', '$ionicLoading', function($rootScope, $state, notice, cookies, $ionicLoading) {
        // 设置跳转
        $rootScope.$on('$stateChangeStart', function(event,
            toState, toParams, fromState, fromParams) {
            var inited = localStorage.inited,
                authorized = cookies.valid();

            if (!inited && toState.name != 'intro') {
                event.preventDefault();
                $state.go('intro');
                return;
            }

            if ( inited && !authorized && toState.name != 'login' ) {
                event.preventDefault();
                $state.go('login');
                return 
            };

            if (authorized && toState.name == 'login') {
                event.preventDefault();
                $state.go('tabs.home');
            };
        });

        function respond(data, alert){
            $rootScope.unread = localStorage._unread || 0;
            localStorage._unread = $rootScope.unread++ ;
            // 保存数据
            notice.save(data);  

            window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
            
            // if (alert) {
            //     $state.go('notices');
            // }

            switch (data.action) {
                case 'pay':
                    $state.go('tabs.charge');
                    break;
                case 'home':
                    $state.go('tabs.home');
                    break;
                case 'fee':
                    $state.go('tabs.charge');
                    break;
                default:
                    break;
            }
        }

        $rootScope.$on('$app:receivePush', function(evt, data){
            console.log('receive: ', data, evt);
            respond(data, true);
        })

        $rootScope.$on('$app:openPush', function(evt, data){
            console.log('open: ', data, evt);
            respond(data, false);
        })
    }]);

app
    .controller('AppCtrl', function($scope,
        $ionicSideMenuDelegate,
        $ionicTabsDelegate,
        $api,
        Me,
        $app,
        $state) {

        $scope.me = Me;
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.changeTab = function(index) {
            $ionicTabsDelegate.$getByHandle('tabs').select(index);
        }

        $scope.logout = function() {
            // 添加确认
            $app.logout();
        }

        $scope.go = function(state) {
            $state.go(state);
            $ionicSideMenuDelegate.toggleLeft();
        }
    })
    .controller('IntroCtrl', ['$scope', '$state', '$ionicSlideBoxDelegate', '$ionicHistory', 'cookies',
        function($scope, $state, $ionicSlideBoxDelegate, $ionicHistory, cookies) {
        // Called to navigate to the main app
        $scope.startApp = function() {
            // 检查登录
            localStorage.inited = true;
            $ionicHistory.clearCache();
            // disable backbutton

            if (cookies.valid()) {
                $state.go('tabs.home');
            } else {
                $state.go('login');
            };
        };

        // Called each time the slide changes
        $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
        };
    }])
    .controller('AuthCtrl', ['$scope', '$state', '$api', 'md5', 'cookies', '$ionicHistory', '$ionicLoading', 
        function($scope, $state, $api, md5, cookies, $ionicHistory, $ionicLoading) {
        $scope.user = {};

        $scope.login = function() {
            var credential = {
                user: $scope.user.user,
                passwd: md5.createHash($scope.user.password).toUpperCase()
            }
            $api.auth.login(credential, function(res) {
                if (!res.code) {
                    // setup cookie
                    cookies.up(res.result, $scope.remember);
                    $ionicHistory.clearCache();
                    $state.go('tabs.home');
                } else {
                    $ionicLoading.show({
                        template: res.message || '登录失败',
                        duration: 1000
                    });
                }
            });
        }
    }]);

// bootstrap
if (!!window.cordova) {
    document.addEventListener('deviceready', function(evt){
        angular.bootstrap(document, ['gugecc']);
    }, false);
}else{
    angular.element(document).ready(function(){
        angular.bootstrap(document, ['gugecc']);
    });
}
