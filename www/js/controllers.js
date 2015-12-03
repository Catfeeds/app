angular.module('starter.controllers', [])
    .controller('RootPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('NavController', function($scope, $ionicSideMenuDelegate) {
        $scope.toggleLeft = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
    })
    .controller('FstController', function($scope, $ionicSideMenuDelegate) {})
    .controller('FstHomePageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('FstFirstPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('FstSecondPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndHomePageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndChatPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndChatSinglePageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndDrinkPageController', function($scope, $ionicSideMenuDelegate) {})
    .controller('SndPolicyPageController', function($scope, $ionicSideMenuDelegate) {});
