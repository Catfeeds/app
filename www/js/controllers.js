angular.module('gugecc.controllers', [])
    .controller('HomeTabCtrl', function($scope, $api, $ionicSideMenuDelegate, $cookies) {
        $scope.account = {};

        $api.account.info({id : $cookies.get('user')}, function(res){
            console.log(res);
            $scope.account = res.result.billingAccount;
        })
    }).controller('AboutCtrl', function($scope, $ionicSideMenuDelegate) {

    })
    .controller('RootPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('NavController', function($scope, $ionicSideMenuDelegate) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
    })
    .controller('Analyze', function($scope, $ionicSideMenuDelegate, deps, $timeout) {
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

        $scope.changeview = function(view){
            $scope.show = view;
            $scope.series = ['用水', '空调', '用电', view];
            $scope.data = $scope.data.reverse();
        }
    })
    .controller('Charge', function($scope, $ionicSideMenuDelegate) {
        $scope.amountSelects = [10, 20, 50, 100, 200, 500];
        $scope.charge = {
            amount : 10,
            gateway: 'wx_pub',
            mobile: ''
        };

    });
