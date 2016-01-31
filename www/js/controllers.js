angular.module('gugecc.controllers', [])
    .controller('HomeTabCtrl', function($scope, $api, $ionicSideMenuDelegate, $cookies, Account) {
        $scope.account = Account;
        var user = $cookies.get('user');
    })
    .controller('Analyze', function($scope, $ionicSideMenuDelegate, $timeout, $api, $cookies, Me, utils, $stateParams) {
        var user = $cookies.get('user');
        $scope.show = $stateParams.type ? $stateParams.type : 'DAY';
        $scope.time = moment().format('YYYYMMDD');

        $scope.$on('create', function (event, chart) {
          $scope.chart = chart;
        });

        $scope.getData = function(type, cb){
            $api.business.energyconsumptioncost({
                'time': $scope.time,
                'project': Me.project,
                'type': type
            }, function(res){
                $scope.usage = utils.bar(res.result[Me.project].detail, $scope.show);
                $scope.list = res.result[Me.project].detail;
                if (cb) {
                    cb();
                };
            });
        }

        $scope.options = {
            legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><b><%=datasets[i].label%></b><small><%=datasets[i].bars.reduce(function(total, now){return total+now.value}, 0)%><%}%>元</small></li><%}%></ul>"
        }

        $scope.colours= [{ // default
              "fillColor": '#F7464A'
            },{ // default
              "fillColor": '#46BFBD'
            },{ // default
              "fillColor": '#FDB45C'
            }];
        $scope.showBar = function(bar, event){
            console.log(bar, $scope.chart);
        }
        $scope.changeview = function(view){
            $scope.show = view;
            $scope.list = [];
            $scope.getData(view);
        }
        $scope.getData($scope.show);
    })
    .controller('AnalyzeDetail', ['$scope', '$api', 'Me', '$stateParams', '$state',
     function ($scope, $api, Me, $stateParams, $state) {
        
    }])
    .controller('Charge', function($scope, 
        Me, 
        $state,
        $cookies, $api, 
        $ionicSideMenuDelegate, $ionicLoading, $ionicModal, $ionicHistory) {
        $scope.me = Me;
        $scope.amountSelects = [100, 200, 500, 1000, 2000, 5000];

        $scope.charge = {
            amount : 100,
            channelaccountid: 3
        };

        $ionicModal.fromTemplateUrl('templates/charge/result.html', {
            scope: $scope
        }).then(function(modal){
            $scope.modal = modal;
        })

        $scope.showModal = function(){
            // 查询余额
            $api.business.userinfo({uid: $cookies.get('user')}, function(res){
                $ionicHistory.clearCache();
                $scope.me = res.result;
            });
            $scope.modal.show();
        }

        $scope.closeModal = function(){
            $state.go($state.current, null, {
                reload: true,
                inherit: false,
                notify: true
            });
            $scope.modal.hide();
        }

        $scope.pay = function(){
            var data = {
                project: Me.project,
                body: '智慧管家充值',
                subject: '智慧管家',
                uid: $cookies.get('user')
            };
            angular.extend(data, $scope.charge);

            $api.payment.charge(data, function(res){
                if(res.code != 0 ){
                    $ionicLoading.show({
                        template: res.message || '服务器错误',
                        duration: 1000
                    });
                    return;
                }

                pingpp.createPayment(res.result, function(result){
                    // 跳转支付成功页面
                    $scope.showModal();
                }, function(err){
                    var msg = {
                        'fail' : '支付失败',
                        'cancel': '用户已取消支付',
                        'invalid': '支付结果无效，请联系支付平台'
                    };
                    $ionicLoading.show({
                        template: msg[err||'invalid'],
                        duration: 2000
                    });
                });

            });
        }
    })
    .controller('Device', ['$scope', '$api', '$cookies', 'Me', '$state', 'info', '$ionicLoading',
        function($scope, $api, $cookies, Me, $state, info, $ionicLoading){
        var project = Me.project;
        
        $scope.canSwitch = function(commands){
            return _.contains(commands, 'EMC_SWITCH');
        }

        $scope.load = function(){
            $scope.devices = [];

            $api.sensor.info({
                project: project
            }, function(res){
                $scope.$broadcast('scroll.refreshComplete');
                if (!res.code) {
                    $scope.devices = res.result.detail;
                };
            })
        }
        $scope.load();

        $scope.showDevice = function(device){
            $state.go('tabs.tab.device_control', {'sensor': device});
        }

        $scope.toggle = function(device, evt){
            var command = device.status && device.status.switch == 'EMC_ON' ? 'EMC_OFF' : 'EMC_ON',
                code = hex_sha1(info.ctrlpasswd).toUpperCase();

            $api.control.send({id: device.id, command: 'EMC_SWITCH', ctrlcode: code, param: {mode: command}}, function(res){
                console.log('res: ', res);
                $ionicLoading.show({
                    template: '命令已发送<br> 稍后下来刷新查看执行状态',
                    duration: 2000
                });
            });

            evt.stopPropagation();
            return false;
        }
    }])
    .controller('DeviceCtrl', ['$scope', '$state', '$api', 'Me', '$stateParams', 'recent', function ($scope, $state, $api, Me, $stateParams, recent) {
        $scope.sensor = $stateParams.sensor;
        $scope.tab = 'control';

        $scope.canSwitch = function(commands){
            return _.contains(commands, 'EMC_SWITCH');
        }

        $scope.show = function(tab){
            $scope.tab = tab;
        }

        $scope.go = function(month){
            $state.go('tabs.tab.device_month', {'month': month, 'device': $scope.sensor.id});
        }

        $scope.recent = recent;
    }])
    .controller('MonthCtrl', ['$scope', '$state', '$api', 'Me', '$stateParams', 'utils', 'days', 
        function ($scope, $state, $api, Me, $stateParams, utils, days) {
        $scope.vm = $stateParams.month;

        $scope.usage = utils.duty($scope.vm.usage);
    }])
    .controller('LogCtrl', ['$scope', '$api', 'Me', '$cookies', '$http', function ($scope, $api, Me, $cookies, $http) {
        $scope.tab = 'charge';
        $scope.paging = {};

        var project = Me.project;
        var query = {
            charges: {
                "project":[{"id":project}],
                "from": moment().subtract(7, 'day').format('YYYYMMDD'),
                "to": moment().format('YYYYMMDD'),
                pageindex: 1,
                pagesize: 20
            },
            fee: {
                // project: Me.project,
                uid: $cookies.get('user'),
                // key: '',
                from: '20000101',
                to: moment().format('YYYYMMDD'),
                // flow: 'EXPENSE',
                category: 'PAYFEES'
            }
        }

        $scope.more = function(type){
            var paging = $scope.paging[type];
            if (!paging) {return true};
            return paging.pageindex * paging.pagesize < paging.count;
        }

        $scope.loadList = function(type){
            if (type == 'charges') {
                $api.business.recentchargelog(query[type], function(res){
                    var page = res.result[project].detail.detail;
                    $scope[type] = $scope[type] ? $scope[type].concat(page) : page;
                    $scope.paging[type] = res.result[project].paging;

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                })
            };

            if (type == 'fee') {
                $api.business.fundflow(query[type], function(res){
                    var page = res.result;
                    $scope[type] = $scope[type] ? $scope[type].concat(page) : page;
                    // $scope.paging[type] = res.result[project].paging;
                    // $scope.$broadcast('scroll.infiniteScrollComplete');
                })
            };
        }

        $scope.loadList('charges');
        $scope.loadList('fee');

        $scope.loadMore = function(type){
            var paging = $scope.paging[type];
            if (!paging) {
                return false;
            };
            if(paging.pageindex * paging.pagesize < paging.count){
                query[type].pageindex ++;
                $scope.loadList(type);
            }
        }

        $scope.getLogs = function(tab){
            tab ? $scope.tab = tab : 1;
        }
    }])
