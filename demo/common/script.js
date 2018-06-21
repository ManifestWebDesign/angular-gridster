'use strict';
angular.module('app', ['gridster', 'ui.bootstrap', 'ngRoute'])
  .config(['$routeProvider',
    function($routeProvider) {
      $routeProvider
        .when('/main', {
          templateUrl: 'demo/main/view.html',
          controller: 'MainCtrl'
        })
        .when('/dashboard', {
          templateUrl: 'demo/dashboard/view.html',
          controller: 'DashboardCtrl'
        })
        .otherwise({
          redirectTo: '/main'
        });
    }
  ])
  .controller('RootCtrl', function($scope) {
    $scope.$on('$locationChangeStart', function(e, next, current) {
      $scope.page = next.split('/').splice(-1);
      $scope.styleUrl = 'demo/' + $scope.page + '/style.css'
    });
  });
