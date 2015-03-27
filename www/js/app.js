﻿'use strict';

var deferred = $.Deferred();

// Declare app level module which depends on views, and components
var app = angular.module('Apptuter', ['ionic', 'rgCacheView'
]).config(function ($stateProvider, $urlRouterProvider) {

    // For any unmatched url, send to /route1
    $urlRouterProvider.otherwise("/register")

    $stateProvider
      .state('register', {
          url: "/register",
          templateUrl: "views/register.html",
          controller: 'registerController',
          resolve:{
              deviceReady: function () {
                  var loc = $('html').injector().get("$location");
                  if (localStorage["fSettings"] != null)
                      loc.path ("/main");
                  return deferred.promise();
              }
          }                     
      })

      .state('main', {
          url: "/main",
          templateUrl: "views/main.html",
          controller: 'mainController',
          resolve: {
              deviceReady: function () {
                  return deferred.promise();
              }
          }

      })
}).config(['$ionicTabsConfig', function ($ionicTabsConfig) {
    // Override the Android platform default to add "tabs-striped" class to "ion-tabs" elements.
    $ionicTabsConfig.type = '';
}]);

app.controller('registerController', ['$scope',function ($scope) {
    require(['js/controllers/registerController'], function (reg) {
        reg($scope)
    })
}])

app.controller('mainController', ['$scope', '$ionicPopup', '$ionicBackdrop', '$ionicLoading', '$ionicTabsDelegate', function ($scope, $ionicPopup, $ionicBackdrop, $ionicLoading, $ionicTabsDelegate) {
    $ionicLoading.show({
        template: '<i class="icon ion-loading-a"></i> Loading...'
    });
    require(['js/controllers/mainController'], function (main) {
        main($scope, $ionicPopup, $ionicBackdrop, $ionicLoading, $ionicTabsDelegate)
    })
}])
app.controller('homeController', ['$scope', function ($scope) {
    require(['js/controllers/homeController'], function (home) {
        home($scope)
    })
}]);
app.controller('aboutController', ['$scope', function ($scope) {
    require(['js/controllers/aboutController'], function (about) {
        about($scope)
    })
}])
app.controller('settingsController', ['$scope', function ($scope) {
    require(['js/controllers/settingsController'], function (settings) {
        settings($scope)
    })
}])
app.filter('removeUrl', function () {
    return function (input) {
        if (!input) return input;
        var wwwRegex = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        return input.replace(wwwRegex, '');
    }
});
app.filter('formateTime', function () {
    return function (input) {
        if (!input) return input;
        var time = new Date(input).toLocaleString();
        time = moment(time).format('MMMM Do YYYY, h:mm ');
        return time;
    }
});
app.filter('arabic', ['$sanitize', '$sce','$parse', function($sanitize,$sce,$parse) {
    var arabicRegex = /[\u0600-\u06FF]/;
    var html = [];
    return function (input) {
        if (!input) return input;
        input = $parse(input);
        debugger
        if (arabicRegex.test(input)) {
            html.push("<p style='direction:rtl'>");
            html.push(input);
            html.push("</p>");
            return $sanitize(html.join(''));
        }
        else
            return input;
    }
}]);
app.filter('fbLikes', function () {
    return function (input) {
        if (!input) return input;
        var total_count = 0;
        var options = {};
        options.status = api.SYNC;
        options.request = {};
        options.request.url = "https://graph.facebook.com/" + input + "/likes?summary=true";
        options.request.type = "GET";
        options.request.dataType = "json";
        options.method = input
        options.localData = function (response) {
            if (!isEmpty(response)) {
                total_count = response.summary.total_count;
            }
        }
        options.validData = function (response) {
            if (!isEmpty(response)) {
                total_count = response.summary.total_count;
            }
            return total_count;
        }
        api.process(options);
    }
});
app.directive('errsrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.errsrc) {
                    attrs.$set('src', attrs.errsrc);
                }
            });
        }
    }
});

document.addEventListener('deviceready', function () { onDeviceReady() }, false);

function onDeviceReady() {
    if (ImgCache) {
        ImgCache.init(function () {
            console.log('ImgCache init: success!');
        }, function () {
            console.log('ImgCache init: error! Check the log for errors');
        });
    }
    deferred.resolve();
}