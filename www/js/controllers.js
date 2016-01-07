angular.module('gugecc.controllers', [])
    .controller('HomeTabCtrl', function($scope, $api, $ionicSideMenuDelegate, $cookies, Account) {
        $scope.account = Account;

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
    .controller('Analyze', function($scope, $ionicSideMenuDelegate, deps, $timeout, $api, $cookies, Me, utils) {
        var user = $cookies.get('user');
        $scope.show = 'DAY';

        $scope.getData = function(cb){
            $api.business.energyconsumptioncost({
                time: moment().format('YYYYMMDD'),
                project: Me.project,
                type: $scope.show
            }, function(res){
                $scope.usage = utils.bar(res.result[Me.project].detail, $scope.show);
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

        $scope.changeview = function(view){
            $scope.show = view;

            $scope.getData();
        }
        $scope.getData();
    })
    .controller('Charge', function($scope, $ionicSideMenuDelegate) {
        $scope.amountSelects = [10, 20, 50, 100, 200, 5000];
        $scope.charge = {
            amount : 10,
            gateway: 'wx_pub',
            mobile: ''
        };
    })
    .controller('Device', ['$scope', '$api', '$cookies', 'Me', function($scope, $api, $cookies, Me){
        var project = Me.project;

        $api.sensor.info({
            project: project
        }, function(res){
            if (!res.code) {
                $scope.devices = res.result.detail;
            };
            console.log($scope.devices);
        })
    }])
