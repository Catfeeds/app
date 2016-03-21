angular.module('gugecc.controllers', [])
    .controller('HomeTabCtrl', function($scope,
        $api,
        $ionicSideMenuDelegate,
        cookies,
        Account, 
        $weather) {
        $scope.account = Account;
        var user = cookies.get('user');

        // 添加天气信息
        $weather.get().then(function(weather){
            console.log(weather);
            $scope.weather = weather.today;
            $scope.city = weather.city;
        });
    })
    .controller('Analyze', function($scope, $ionicSideMenuDelegate, $timeout, $api, cookies, Me, utils, $stateParams, datePickerSettings) {
        var user = cookies.get('user');
        $scope.show = $stateParams.type ? $stateParams.type : 'DAY';
        $scope.time = moment().format('YYYYMMDD');

        $scope.showLeft = function() {
            $ionicSideMenuDelegate.toggleLeft()
        }

        $scope.datepicker = datePickerSettings();
        $scope.datepicker.to = new Date();
        $scope.datepicker.callback = function(val) {
            if (!val) {
                return false;
            };
            $scope.time = moment(val).format('YYYYMMDD');
            $scope.getData($scope.show);
        }

        $scope.$on('create', function(event, chart) {
            $scope.chart = chart;
        });

        $scope.getData = function(type, cb) {
            $api.business.energyconsumptioncost({
                'time': $scope.time,
                'project': Me.project,
                'type': type
            }, function(res) {
                $scope.usage = utils.bar(res.result[Me.project].detail, $scope.show);
                $scope.list = res.result[Me.project].detail;
                if (cb) {
                    cb();
                };
            });
        }

        $scope.options = {}

        $scope.colours = [{ // default
            "fillColor": '#F7464A'
        }, { // default
            "fillColor": '#46BFBD'
        }, { // default
            "fillColor": '#FDB45C'
        }];
        $scope.showBar = function(bar, event) {
            console.log(bar, $scope.chart);
        }
        $scope.changeview = function(view) {
            $scope.show = view;
            $scope.list = [];
            $scope.getData(view);
        }
        $scope.getData($scope.show);
    })
    .controller('AnalyzeDetail', ['$scope', '$api', 'Me', '$stateParams', '$state',
        function($scope, $api, Me, $stateParams, $state) {

        }
    ])
    .controller('Charge', function($scope,
        Me,
        $state,
        cookies, $api,
        channels,
        $ionicSideMenuDelegate, $ionicLoading, $ionicModal, $ionicHistory) {
        $scope.me = Me;
        $scope.amountSelects = [100, 500, 1000, 2000, 5000];
        $scope.otherAmount = '';
        $scope.channels = channels;

        $scope.charge = {
            amount: 100,
            channelaccountid: channels ? channels[0].id : undefined
        };

        $scope.checkKey = 'a0';

        $scope.setAmount = function(amount, reset, key) {
            $scope.charge.amount = amount;
            if (reset) {
                $scope.otherAmount = '';
            };
            $scope.checkKey = key;
        }

        $ionicModal.fromTemplateUrl('templates/charge/result.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        })

        $scope.showModal = function() {
            // 查询余额
            $api.business.userinfo({ uid: cookies.get('user') }, function(res) {
                $ionicHistory.clearCache();
                $scope.me = res.result;
            });
            $scope.modal.show();
        }

        $scope.closeModal = function() {
            $state.go($state.current, null, {
                reload: true,
                inherit: false,
                notify: true
            });
            $scope.modal.hide();
        }

        $scope.pay = function() {
            // 提示无充值渠道错误
            if (!channels) {
                $ionicLoading.show({
                    template: '暂无可用充值渠道',
                    duration: 1000
                });
                return;
            }

            if (!$scope.charge.amount && !angular.isNumber($scope.charge.amount)) {
                $ionicLoading.show({
                    template: '请选择正确的金额',
                    duration: 1000
                });
                return;
            };

            var data = {
                project: Me.project,
                body: '智慧管家充值',
                subject: '智慧管家',
                uid: cookies.get('user')
            };
            angular.extend(data, $scope.charge);

            $api.payment.charge(data, function(res) {
                if (res.code != 0) {
                    $ionicLoading.show({
                        template: res.message || '服务器错误',
                        duration: 1000
                    });
                    return;
                }

                pingpp.createPayment(res.result, function(result) {
                    // 跳转支付成功页面
                    $scope.showModal();
                }, function(err) {
                    var msg = {
                        'fail': '支付失败',
                        'cancel': '用户已取消支付',
                        'invalid': '支付结果无效，请联系支付平台'
                    };
                    $ionicLoading.show({
                        template: msg[err || 'invalid'],
                        duration: 2000
                    });
                });

            });
        }
    })
    .controller('Device', ['$scope', '$api', 'cookies', 'Me', '$state', 'info', '$ionicLoading',
        function($scope, $api, cookies, Me, $state, info, $ionicLoading) {
            var project = Me.project;

            $scope.canSwitch = function(commands) {
                return _.contains(commands, 'EMC_SWITCH');
            }

            $scope.load = function() {
                $scope.devices = [];

                $api.sensor.info({
                    project: project
                }, function(res) {
                    $scope.$broadcast('scroll.refreshComplete');
                    if (!res.code) {
                        $scope.devices = res.result.detail;
                    };
                })
            }
            $scope.load();

            $scope.showDevice = function(device) {
                $state.go('tabs.tab.device_control', { 'sensor': device });
            }

            $scope.toggle = function(device, evt) {
                navigator.notification.confirm('', function(res){
                    if (res == 2) {
                        return false;
                    }

                    var command = device.status && device.status.switch == 'EMC_ON' ? 'EMC_OFF' : 'EMC_ON',
                        code = hex_sha1(info.ctrlpasswd).toUpperCase();

                    $api.control.send({ id: device.id, command: 'EMC_SWITCH', ctrlcode: code, param: { mode: command } }, function(res) {
                        console.log('res: ', res);
                        $ionicLoading.show({
                            template: '命令已发送<br> 稍后下来刷新查看执行状态',
                            duration: 2000
                        });
                        device.status.switch = command;
                    });
                }, '确认执行操作?', ['确认', '取消']);

                evt.stopPropagation();
                return false;
            }
        }
    ])
    .controller('DeviceCtrl', ['$scope', '$state', '$api', 'Me', '$stateParams', 'recent', 'info', '$ionicLoading', '$ionicPopup',
        function($scope, $state, $api, Me, $stateParams, recent, info, $ionicLoading, $ionicPopup) {
            $scope.sensor = $stateParams.sensor;
            $scope.tab = 'control';

            $scope.toggle = function(device, evt) {
                // 调用 confirm
                navigator.notification.confirm('', function(res){
                    if (res == 2) {
                        return false;
                    }

                    var command = device.status && device.status.switch == 'EMC_ON' ? 'EMC_OFF' : 'EMC_ON',
                        code = hex_sha1(info.ctrlpasswd).toUpperCase();

                    $api.control.send({ id: device.id, command: 'EMC_SWITCH', ctrlcode: code, param: { mode: command } }, function(res) {
                        console.log('res: ', res);
                        $ionicLoading.show({
                            template: '命令已发送<br> 稍后下来刷新查看执行状态',
                            duration: 2000
                        });
                    });
                }, '确认执行操作?', ['确认', '取消']);

                evt.stopPropagation();
            }

            $scope.statusImg = function(device) {
                return device.status && device.status.switch == 'EMC_ON' ? 'img/switchOn.png' : 'img/switchOff.png';
            }

            $scope.canSwitch = function(commands) {
                return _.contains(commands, 'EMC_SWITCH');
            }

            $scope.show = function(tab) {
                $scope.tab = tab;
            }

            $scope.go = function(month) {
                $state.go('tabs.tab.device_month', { 'month': month, 'device': $scope.sensor.id });
            }

            $scope.recent = recent;
        }
    ])
    .controller('MonthCtrl', ['$scope', '$state', '$api', 'Me', '$stateParams', 'utils', 'days',
        function($scope, $state, $api, Me, $stateParams, utils, days) {
            $scope.vm = $stateParams.month;

            $scope.usage = utils.duty(days.usage);

            $scope.colours = [{ // default
                "fillColor": '#FCA9A9'
            }, { // default
                "fillColor": '#DF1C1C'
            }, { // default
                "fillColor": '#FDB45C'
            }];
        }
    ])
    .controller('LogCtrl', ['$scope', '$api', 'Me', 'cookies', '$http', function($scope, $api, Me, cookies, $http) {
        $scope.tab = 'charge';
        $scope.paging = {};

        var project = Me.project;
        var query = {
            charges: {
                "project": [{ "id": project }],
                "from": moment().subtract(6, 'month').format('YYYYMMDD'),
                "to": moment().format('YYYYMMDD'),
                pageindex: 1,
                pagesize: 20,
                status: 'SUCCESS'
            },
            fee: {
                // project: Me.project,
                uid: cookies.get('user'),
                // key: '',
                from: '20160101',
                to: moment().format('YYYYMMDD'),
                // flow: 'EXPENSE',
                category: 'PAYFEES'
            }
        }

        $scope.more = function(type) {
            var paging = $scope.paging[type];
            if (!paging) {
                return true };
            return paging.pageindex * paging.pagesize < paging.count;
        }

        $scope.loadList = function(type) {
            if (type == 'charges') {
                $api.business.recentchargelog(query[type], function(res) {
                    var page = res.result[project].detail.detail;
                    $scope[type] = $scope[type] ? $scope[type].concat(page) : page;
                    $scope.paging[type] = res.result[project].paging;

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                })
            };

            if (type == 'fee') {
                $api.business.fundflow(query[type], function(res) {
                    var page = res.result;
                    $scope[type] = $scope[type] ? $scope[type].concat(page) : page;
                    // $scope.paging[type] = res.result[project].paging;
                    // $scope.$broadcast('scroll.infiniteScrollComplete');
                })
            };
        }

        $scope.loadList('charges');
        $scope.loadList('fee');

        $scope.loadMore = function(type) {
            var paging = $scope.paging[type];
            if (!paging) {
                return false;
            };
            if (paging.pageindex * paging.pagesize < paging.count) {
                query[type].pageindex++;
                $scope.loadList(type);
            }
        }

        $scope.getLogs = function(tab) {
            tab ? $scope.tab = tab : 1;
        }
    }])
