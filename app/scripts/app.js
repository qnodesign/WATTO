'use strict';
var openFB = openFB || {};
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

angular.module('watto', ['ionic', 'watto.controllers'])

.run(function($ionicPlatform,$timeout) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    
    $timeout(function() {
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        //StatusBar.styleLightContent();
        // StatusBar.overlaysWebView(false);
        StatusBar.styleBlackTranslucent();
        StatusBar.backgroundColorByName('black');

      }
    }, 300); 
    
  });
})

.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(5);

  // note that you can also chain configs
  $ionicConfigProvider.backButton.text('Back').icon('ion-ios-arrow-left');
})

.config(function($sceProvider) {
  // Completely disable SCE.  For demonstration purposes only!
  // Do not use in new projects.
  $sceProvider.enabled(false);
})

.config(function($stateProvider, $urlRouterProvider) {

  openFB.init({appId: '734151323370803'});

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('app.profile', {
    url: '/profile',
    views: {
        'menuContent' :{
            templateUrl: 'templates/profile.html',
            controller: 'ProfileCtrl'
        }
    }
  })

  .state('app.recent', {
    url: '/recent',
    views: {
      'menuContent': {
        templateUrl: 'templates/recent.html',
        controller: 'RecentCtrl'
      }
    }
  })

  .state('app.watchlist', {
    url: '/watchlist',
    views: {
      'menuContent': {
        templateUrl: 'templates/watchlist.html',
        controller: 'WatchlistCtrl'
      }
    }
  })

  .state('app.setup', {
    url: '/setup',
    views: {
      'menuContent': {
        templateUrl: 'templates/setup.html',
        controller: 'SetupCtrl'
      }
    }
  })

  .state('app.getmovie', {
    url: '/getmovie',
    views: {
      'menuContent': {
        templateUrl: 'templates/getmovie.html',
        controller: 'GetMovieCtrl'
      }
    }
  })
  .state('app.getmovieId', {
    url: '/getmovie/:movieId',
    views: {
      'menuContent': {
        templateUrl: 'templates/getmovie.html',
        controller: 'GetMovieCtrl'
      }
    }
  })

  .state('app.youtube-video', {
    url: '/youtube-video/:videoId',
    views: {
      'menuContent': {
        templateUrl: 'templates/youtube-video.html',
        controller: 'YouTubeVideoCtrl'
      }
    }
  })

  .state('app.filters', {
    url: '/filters',
    views: {
      'menuContent': {
        templateUrl: 'templates/filters.html',
        controller: 'FiltersCtrl'
      }
    }
  })

  .state('app.filters-genres', {
    url: '/filters-genres',
    views: {
      'menuContent': {
        templateUrl: 'templates/filters-genres.html',
        controller: 'FiltersCtrl'
      }
    }
  })

  .state('app.filters-countries', {
    url: '/filters-countries',
    views: {
      'menuContent': {
        templateUrl: 'templates/filters-countries.html',
        controller: 'FiltersCtrl'
      }
    }
  })
  .state('app.filters-release-date', {
    url: '/filters-release-date',
    views: {
      'menuContent': {
        templateUrl: 'templates/filters-release-date.html',
        controller: 'FiltersCtrl'
      }
    }
  })
  .state('app.filters-actors', {
    url: '/filters-actors',
    views: {
      'menuContent': {
        templateUrl: 'templates/filters-actors.html',
        controller: 'FiltersCtrl'
      }
    }
  })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
})

.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                //call the function that was passed
                scope.$apply(attrs.imageonload);
            });
        }
    };
});