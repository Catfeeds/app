angular.module('gugecc.controllers', [])
    .controller('HomeTabCtrl', function($scope, $api, $ionicSideMenuDelegate, $cookies, Account) {
        $scope.account = Account.billingAccount;

        var user = $cookies.get('user');

        $api.business.monthlyusage({
            time: moment().format('YYYYMM'),
            account: user
        }, function(res){
            $scope.usage = res.result[user];
        });
    }).controller('AboutCtrl', function($scope, $ionicSideMenuDelegate) {

    })
    .controller('NavController', function($scope, $ionicSideMenuDelegate) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
    })
    .controller('Analyze', function($scope, $ionicSideMenuDelegate, deps, $timeout, $api, $cookies) {
        var user = $cookies.get('user');
        $api.business.monthlyaccountelectricusage({
            time: moment().format('YYYYMM'),
            account: user
        }, function(res){
            $scope.usage = res.result[user];
        });

        $scope.labels = ["1", "2", "3", "4", "5", "6", "7"];
        $scope.series = ['用水', '空调', '用电'];
        $scope.colours= [{ // default
          "fillColor": '#F7464A'
        },{ // default
          "fillColor": '#46BFBD'
        },{ // default
          "fillColor": '#FDB45C'
        }];
        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90],
            [18, 28, 4, 9, 16, 27, 20]
        ];

        $scope.options = {
            legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><b><%=datasets[i].label%></b><small><%=datasets[i].bars.reduce(function(total, now){return total+now.value}, 0)%><%}%>元</small></li><%}%></ul>"
        }

        $scope.changeview = function(view){
            $scope.show = view;
            $scope.series = ['用水', '空调', '用电', view];
            $scope.data = _.shuffle($scope.data);
        }
    })
    .controller('Charge', function($scope, $ionicSideMenuDelegate) {
        $scope.amountSelects = [10, 20, 50, 100, 200, 500];
        $scope.charge = {
            amount : 10,
            gateway: 'wx_pub',
            mobile: ''
        };
    })
    .controller('Device', ['$scope', '$api', '$cookies', 'Me', function($scope, $api, $cookies, Me){
        var project = Me.resource.project[0];

        $api.sensor.info({
            project: project
        }, function(res){
            if (!res.code) {
                $scope.devices = res.result.detail;
            };
            console.log($scope.devices);
        })
    }])
