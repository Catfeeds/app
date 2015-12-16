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
    .controller('Analyze', function($scope, $ionicSideMenuDelegate, deps) {
        console.log('analyze deps', deps);

        $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
        $scope.series = ['Series A', 'Series B', 'Series C'];

        $scope.data = [
            [65, 59, 80, 81, 56, 55, 40],
            [28, 48, 40, 19, 86, 27, 90],
            [28, 48, 40, 19, 86, 27, 90]
        ];
    })
    .controller('FstHomePageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('FstFirstPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('FstSecondPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndHomePageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndChatPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndChatSinglePageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndDrinkPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndPolicyPageController', function($scope, $ionicSideMenuDelegate) {});
