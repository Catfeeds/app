angular.module('gugecc.controllers', [])
    .controller('HomeTabCtrl', function($scope, $api, $ionicSideMenuDelegate, $cookies, Account) {
        $scope.account = Account;
        var user = $cookies.get('user');
    })
    .controller('Analyze', function($scope, $ionicSideMenuDelegate, deps, $timeout, $api, $cookies, Me, utils, $stateParams) {
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
    .controller('AnalyzeDetail', ['$scope', '$api', 'Me', '$stateParams', '$state', function ($scope, $api, Me, $stateParams, $state) {
        
    }])
    .controller('Charge', function($scope, $ionicSideMenuDelegate, Me, $cookies, $api, $ionicLoading) {
        $scope.me = Me;
        $scope.amountSelects = [10, 20, 50, 100, 200, 5000];

        $scope.charge = {
            amount : 10,
            channelaccountid: 3
        };

        $scope.pay = function(){
            var data = {
                project: Me.project,
                body: '智慧管家充值',
                subject: '智慧管家',
                uid: $cookies.get('user')
            };
            angular.extend(data, $scope.charge);

            $api.payment.charge(data, function(res){
                if(res.code){
                    $ionicLoading.show({
                        template: res.message,
                        duration: 1000
                    });
                    return;
                }

                pingpp.createPayment(res.result, function(msg, err){
                    if (err) {
                        $ionicLoading.show({
                            template: msg,
                            duration: 1000
                        });
                    };

                    // 跳转支付成功页面
                    
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
    .controller('DeviceCtrl', ['$scope', '$state', '$api', 'Me', '$stateParams', 'usage', function ($scope, $state, $api, Me, $stateParams, usage) {
        $scope.sensor = $stateParams.sensor;
        $scope.tab = 'control';

        $scope.show = function(tab){
            $scope.tab = tab;
        }

        $scope.toggle = function(){
            
        }

        $scope.usage = usage.detail;
        $scope.total = $scope.usage.reduce(function(sum, val){
            return sum + val.total;
        }, 0);
    }])
    .controller('LogCtrl', ['$scope', '$api', 'Me', '$cookies', '$http', function ($scope, $api, Me, $cookies, $http) {
        $scope.tab = 'charge';
        var project = '549bfb89b06197280985bf10';
        $api.business.recentchargelog({
            "project":[{"id":project}],
            "from": "20160120",
            "to": "20160125"
        }, function(res){
            $scope.charges = res.result[project].detail.detail;
            console.log($scope.charges);
        })

        $http.post('api/business/fundflow', 
            {
                project: Me.project,
                uid: $cookies.get('user'),
                key: '',
                from: '20000101',
                to: moment().format('YYYYMMDD'),
                // flow: 'EXPENSE',
                // category: 'PAYFEES'
            })
            .success(function(res){
                console.log(res);
            })

        $scope.getLogs = function(tab){
            tab ? $scope.tab = tab : 1;
        }
    }])
