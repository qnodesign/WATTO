'use strict';
var openFB = openFB || {};

angular.module('watto.controllers', ['ui.bootstrap'])

.controller('AppCtrl', function($scope, $rootScope, $http, $location, $ionicSideMenuDelegate, $ionicActionSheet, $ionicLoading, $log) {

  // PRIVATE DB
  $rootScope.db_host = 'http://wapi-qno.rhcloud.com/ws/';
  //$rootScope.db_host = 'localhost:8080/ws/';

  // FACEBOOK LOGIN
  $scope.fbInit = function() {
    //{id: "10205266640638487", name: "Konrád Hefelle"}

    //localStorage.removeItem('user');
    //localStorage.setItem('user','{"id": "10205266640638487", "name": "Konrád Hefelle"}');
    var user = angular.fromJson(localStorage.getItem('user'));

    var setWatchlist = function(user) {
      $rootScope.user = user;
      $rootScope.facebookLoggedIn = true;
      $http.get($rootScope.db_host + 'watchlist/' + user.id).
          success(function(data){
              var res = data.length ? data[0].results : [];
              localStorage.setItem('movies.watchlistDetails',angular.toJson(res));
              var wl = [];
              angular.forEach(res,function(k){
                  wl.push(k.id);
              });
              localStorage.setItem('movies.watchlist',angular.toJson(wl));      
          });
    };

    
    if(user !== null) {
      $http.get($rootScope.db_host + 'user/' + user.id).
        success(function(data){
          if(data.length) {
            setWatchlist(data[0]);

            /*$http.post($rootScope.db_host + 'watchlist',{'uid': user.id, 'results': localStorage.getItem('movies.watchlist')}).
              success(function(data){
                $log.log(data);
              }).
              error(function(data){
                $log.log(data);
              });*/  
          } else {
            $log.log('No record in DB based on the local storage');
          }
        });
    } else {
      openFB.api({
          path: '/me',
          params: {fields: 'id,name,email'},
          success: function(user) {
              localStorage.setItem('user', angular.toJson(user));
              $http.post($rootScope.db_host + 'user', user).
                success(function(data){
                  $log.log('User logged in and DB record syncronized ' + data);
                  setWatchlist(user);
                }).
                error(function(err){
                  $log.log('DB error: ' + err);
                });      

              $scope.$apply(function() {
                  
              });
          },
          error: function(error) {
              $log.log('Facebook error message: ' + error.message + ' Type: ' + error.type + ', Code: ' + error.code);
          }
      });
    }
    

  };
  $scope.fbInit();

  $scope.fbLogin = function() {
    openFB.login(
        function(response) {
            if (response.status === 'connected') {
                $log.log('Facebook login succeeded');
                $scope.$apply(function() {  
                    $rootScope.facebookLoggedIn = true;
                    $scope.fbInit();
                });
            } else {
                $log.log('Facebook login failed');
            }
        },
        {scope: 'email'});

  };

  $scope.logout = function() {
    $log.log('logout');
    $rootScope.facebookLoggedIn = false;
    openFB.logout( function() {
        $log.log('Facebook successfully logged out');
          localStorage.removeItem('user');
      }, function(error) {
          $rootScope.facebookLoggedIn = true;
          $log.log('Facebook error message: ' + error.message + ' Type: ' + error.type + ', Code: ' + error.code);
      });
  };

  $scope.killApp = function() {
    $log.log('killApp');
    $rootScope.facebookLoggedIn = false;
    openFB.revokePermissions( function() {
        $log.log('Facebook successfully revoked');
        $http.post($rootScope.db_host + 'deluser', localStorage.getItem('user')).
          success(function(data){
            localStorage.removeItem('user');
            $log.log(data);
          }).
          error(function(err){
            $log.log('DB error: ' + err);
          });     
      }, function(error) {
          $rootScope.facebookLoggedIn = true;
          $log.log('Facebook error message: ' + error.message + ' Type: ' + error.type + ', Code: ' + error.code);
      });
  };

// MOVIE BACKDROP NAV
  $scope.actionSheetButtonFunc1 = function(t) {
    // TODO develop func
      $log.log(t);
  };
  $scope.actionSheetButtonFunc2 = function(t) {
    // TODO develop func
      $log.log(t);
  };
  $scope.toggleMovieBackdrop = function() {
    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
          buttons: [
            { text: 'Share'},
            { text: 'Move' }
          ],
          destructiveText: 'Dont show it again',
          titleText: 'Movie control',
          cancelText: 'Cancel',
          cancel: function() {
            hideSheet();
          },
          destructiveButtonClicked: function(index) {
            $log.log('delete movie'+index);
            return true;
          },
          buttonClicked: function(index) {
            switch(index) {
              case 0:
                $scope.actionSheetButtonFunc1(index+1);
              break;
              case 1:
                $scope.actionSheetButtonFunc2(index+1);
              break;
            }
            return true;
          }
        });
  };

  $rootScope.today = new Date().toJSON().slice(0,10);
  $rootScope.tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toJSON().slice(0,10);

  $rootScope.reset = function() {
      $rootScope.dataIterator = 0;
      $rootScope.maxpages = 12;
      $rootScope.initialpages = 6; // after 6 pages 120 movie the first random result will be shown; 
      $rootScope.storageChanged = true;
     // $log.log($rootScope.dataIterator,$rootScope.maxpages,$rootScope.initialpages);
  };
  $rootScope.reset();

  $rootScope.hideLoading = function() {
      $rootScope.loading=false; 
      $ionicLoading.hide();    
  };
  
  $scope.toggleLeftSideMenu = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.editAvalilable = function() {
    $rootScope.editAvalilable = $rootScope.editAvalilable === true ? false : true;
  };
  
 // initial state of app
  $scope.topMenu = { 
    isLeftAction : false,
    isRightMenuHref : true,
    rightMenuHref : '#/app/setup', 
    rightMenuClass : 'button-icon ion-ios-gear-outline'
  };

  $scope.$on('$ionicView.beforeLeave', function(){
    $scope.topMenu = {};
  });

  $scope.$on('$ionicView.afterLeave', function(){
    switch($location.url().split('/')[2]) {
      case 'home':
        $scope.topMenu.isRightMenuHref = true;
        $scope.topMenu.rightMenuHref = '#/app/setup'; 
        $scope.topMenu.rightMenuClass = 'button-icon ion-ios-gear-outline';
      break;   

      case 'filters-actors':
        $scope.topMenu.isRightMenu = true;
        $scope.topMenu.rightMenuLabel = 'Edit';
        $scope.topMenu.rightMenuAction = $scope.editAvalilable; 
      break;

      case 'getmovie':
        $scope.topMenu.isLeftMenu = true;
        $scope.topMenu.isRightMenu = true;
        $scope.topMenu.leftMenuClass = 'button-icon ion-navicon';
        $scope.topMenu.rightMenuClass = 'button-icon ion-ios-upload-outline';
        $scope.topMenu.leftMenuAction = $scope.toggleLeftSideMenu;
        $scope.topMenu.rightMenuAction = $scope.toggleMovieBackdrop;
      break;   
    } 
  });

})

.controller('SetupCtrl', function($scope, $rootScope, $stateParams, $ionicPopup) {
  $scope.title = 'Settings';

  var size=0; 
  for(var x in localStorage) {
    size += ((localStorage[x].length * 2)/1024/1024);
  }

  $scope.lsd = size.toFixed(2);

  $scope.clearAllData = function() {
    $ionicPopup.confirm({
       title: 'Clear all local data',
       template: 'Are you really want to clear all local data?',
       buttons: [
         {
           text: 'Cancel',
           type: 'button-outline button-energized'
         },
         {
           text: '<b>Delete</b>',
           type: 'button-outline button-assertive',
           onTap: function() {
              return true;
           }
         }
       ]
     }).
     then(function(res) {
       if(res) {
         $rootScope.reset();
         localStorage.clear();
       }
     });
  };
})

.controller('HomeCtrl', function($scope) {
  $scope.title = '<ins>W</ins>ATTO';
  $scope.hcover = true;
})

.controller('ProfileCtrl', function($scope) {
  $scope.title = 'PROFILE';
  $scope.hcover = true;
})

.controller('FiltersCtrl', function($scope, $http, $stateParams, $ionicPopup, $ionicLoading, $rootScope, $log) {
  $scope.title = 'Filters';
  $scope.genresTitle = 'genres';
  $scope.releaseDateTitle = 'Release date';
  $scope.countriesTitle = 'Countries';
  $scope.actorsTitle = 'Actors';



// ------------------ RELEASE DATES 

  var fromDate, toDate;

  var lfd = localStorage.getItem('filters.fromDate');
  var ltd = localStorage.getItem('filters.toDate');
    
  
  $scope.a = lfd === null ? new Date(1920,0,1,11,0,0) : new Date(lfd);
  $scope.b = ltd === null ? new Date() : new Date(ltd);
  $scope.toMin = lfd === null ? new Date(1920,0,1,11,0,0).toJSON().slice(0,10) : new Date(lfd).toJSON().slice(0,10);

  $scope.setupDates = function() {
    lfd = localStorage.getItem('filters.fromDate');
    ltd = localStorage.getItem('filters.toDate');
    $rootScope.fromDate = lfd !== null || ltd !== null ? $scope.a.toJSON().slice(0,10) : '';
    $rootScope.toDate = ltd !== null ? ' - ' + $scope.b.toJSON().slice(0,10) : lfd !== null ? ' - till today' : '';
  };

  $scope.setFromDate = function(a){
    $rootScope.reset();
    if(a==='' || !a) {
      $scope.wfd = true;
      localStorage.removeItem('filters.fromDate');
    } else {
      $scope.wfd = false;
      var ca = new Date(a).toString().substr(0,15)+' 12:00:00';
      fromDate = $scope.toMin = new Date(ca).toJSON().slice(0,10);
      localStorage.setItem('filters.fromDate', fromDate);
      $rootScope.fromDate = fromDate;
    }
  };

  $scope.setToDate = function(b){
    $rootScope.reset();
    if(b==='' || !b) {
      $scope.wtd = true;
      localStorage.removeItem('filters.toDate');
    } else {
      $scope.wtd = false;
      var ca = new Date(b).toString().substr(0,15)+' 12:00:00';
      toDate = new Date(ca).toJSON().slice(0,10);
      localStorage.setItem('filters.toDate', toDate);
      $rootScope.toDate = toDate;
    } 
  };



// ------------------ LANGUAGES 
/*
// setup selected languages for the root.
  $scope.setupLanguages = function() { 
    $rootScope.storageChanged=true;
    $rootScope.sela = [];
    angular.forEach($scope.selected_language, function(i,k){
      angular.forEach($scope.languaes, function(l,m){
      if(i==true && k==l.id)
        $rootScope.sela.push(l.name);
      });
    });
  };
  $scope.resetLanguages = function(){
      $scope.selected_language = {};
      localStorage.removeItem('filters.selected_languages');
      $scope.setupLanguages();
  };
  $scope.selectLanguage = function(){
    if($scope.selected_language) {
      localStorage.setItem('filters.selected_languages', angular.toJson($scope.selected_language));
      $scope.setupLanguages();
    } else {
      $log.log('Error');
    }
  };

  var sl = angular.fromJson(localStorage.getItem('filters.selected_languages'));
  $scope.selected_language = sl !=null ? sl : {};
// get languages
  $http.get('json/languages.json')
    .success(function(data){
      $scope.languages = data;
      $log.log(data);
      $scope.setupLanguages();
    });

*/

// ------------------ GENRES 

// setup selected genres for the root.
  $scope.setupGenres = function() { 
    $rootScope.sege = [];
    angular.forEach($scope.selectedGenre, function(i,k){
      angular.forEach($scope.genres, function(l){
        if(i===true && k===l.id.toString()) {
          $rootScope.sege.push(l.name);
        }
      });
    });
  };
  $scope.resetGenres = function(){
      $rootScope.reset();
      $scope.selectedGenre = {};
      localStorage.removeItem('filters.selectedGenres');
      $scope.setupGenres();
  };
  $scope.selectGenre = function(){
    if($scope.selectedGenre) {
      $rootScope.reset();
      localStorage.setItem('filters.selectedGenres', angular.toJson($scope.selectedGenre));
      $scope.setupGenres();
    } else {
      $log.log('Error');
    }
  };


  var sg = angular.fromJson(localStorage.getItem('filters.selectedGenres')),
      ag = angular.fromJson(localStorage.getItem('genres'));

  $scope.selectedGenre = sg !==null ? sg : {};

  $scope.genres = ag !==null ? ag : null;
// get genres


  if($scope.genres === null || $scope.genres === 'null') {
    $http.get('http://api.themoviedb.org/3/genre/movie/list?api_key=d5dc997b35ea773ef7edc72bb47dca1e').success(function(data){
        $scope.genres = data.genres;
        localStorage.setItem('genres', angular.toJson($scope.genres));
        $scope.setupGenres();
        $scope.setupDates();
      });
  }
 // ------------------ ALL FILTERS 


  $scope.$on('$ionicView.beforeLeave', function(){
    $scope.setupDates();
  });

  $scope.$on('$ionicView.enter', function(){
    var sg = angular.fromJson(localStorage.getItem('filters.selectedGenres'));
    $scope.selectedGenre = sg !==null ? sg : {};
    $scope.setupGenres();
    $scope.setupDates();
  });

  $scope.onlypro = function(){
     $ionicPopup.alert({
       title: '',
       template: 'This feature is available only in WATTO PRO'
     });
  };

 // ------------------ ALL FILTERS 

  $scope.clearAllFilters = function(){
    var confirmPopup = $ionicPopup.confirm({
       title: 'Clear all filters',
       template: 'Are you really want to clear all filters?',
       buttons: [
         {
           text: 'Cancel',
           type: 'button-outline button-energized'
         },
         {
           text: '<b>Delete</b>',
           type: 'button-outline button-assertive',
           onTap: function() {
              return true;
           }
         }
       ]
     });
     confirmPopup.then(function(res) {
       if(res) {
         $rootScope.reset();
         localStorage.removeItem('filters.actors');
         // localStorage.removeItem('filters.selected_languages');
         localStorage.removeItem('filters.selectedGenres');
         localStorage.removeItem('filters.fromDate');
         localStorage.removeItem('filters.toDate');
         $rootScope.sege = [];
         $scope.setupDates();
       }
     });
  };
})

// SCE need to be fixed and angular youtube js install

.controller('YouTubeVideoCtrl', function($scope,$stateParams) {
  $scope.video = 'http://www.youtube.com/embed/'+$stateParams.videoId+'?autoplay=1&cc_load_policy=1';
})

.controller('RatingCtrl', function($scope) {
  $scope.max = 5;
  $scope.isReadonly = true;

  $scope.ratingStates = [
    {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
    {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
    {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
    {stateOn: 'glyphicon-heart'},
    {stateOff: 'glyphicon-off'}
  ];
})

.controller('RecentCtrl', function($scope) {

  $scope.title = 'RECENT MOVIES';
  $scope.doRefresh = function() {  
    $scope.recent = angular.fromJson(localStorage.getItem('movies.recentDetailed') || '[]');
    $scope.$broadcast('scroll.refreshComplete');
  };
  $scope.doRefresh();

})

.controller('WatchlistCtrl', function($scope) {

  $scope.title = 'WATCHLIST';
  $scope.doRefresh = function() {  
    var watchlistDetails = localStorage.getItem('movies.watchlistDetails');
    $scope.watchlistDetails = watchlistDetails !== '' ? angular.fromJson(watchlistDetails) : '';
    $scope.$broadcast('scroll.refreshComplete');
  };
  $scope.doRefresh();

})

.controller('GetMovieCtrl', function($scope, $http, $state, $stateParams, $timeout, $rootScope, $location, $ionicLoading, $ionicScrollDelegate, $log) {


  $scope.title = '<ins>W</ins>ATTO';
  // init values
  
  $scope.recentMovies = angular.fromJson(localStorage.getItem('movies.recent') || '[]');
  $scope.recentMoviesDetails = angular.fromJson(localStorage.getItem('movies.recentDetailed') || '[]');


// watchlist
  var watchlist = localStorage.getItem('movies.watchlist');
  var watchlistDetails = localStorage.getItem('movies.watchlistDetails');
  $scope.watchlist = watchlist !== '' ? angular.fromJson(watchlist) : [];
  $scope.watchlistDetails = watchlistDetails !=='' ? angular.fromJson(watchlistDetails) : [];


  var watchListOperation = function() {
    localStorage.setItem('movies.watchlist', angular.toJson($scope.watchlist));
    localStorage.setItem('movies.watchlistDetails', angular.toJson($scope.watchlistDetails));
    
    $log.log($rootScope.user);
    $http.post($rootScope.db_host + 'watchlist',{'uid': $rootScope.user.id, 'results': $scope.watchlistDetails}).
      success(function(data){
        $log.log(data);
      }).
      error(function(data){
        $log.log(data);
      }); 

  };


  $scope.toWatchList = function(){
    $scope.watchlist.push($scope.movie.id);
    $scope.watchlistDetails.push($scope.movie);
    watchListOperation();
    $scope.onTheWatchList = true;
  };
  $scope.removeFromWatchList = function(){
    var index = $scope.watchlist.indexOf($scope.movie.id);
    $scope.watchlist.splice(index, 1);
    $scope.watchlistDetails.splice(index, 1);
    watchListOperation();
    $scope.onTheWatchList = false;
  };


  $scope.hcover = true;
  $scope.showTrailer = false;
  $scope.showCover = function(){
    $scope.hcover = false;
  };

  $scope.hideLoading = $rootScope.hideLoading;

  $scope.gimmeNew = function () {
      $rootScope.maxpages = $rootScope.maxpages + 6;
      $scope.getData();
      $rootScope.loading=true;
      $scope.generate();
  };

  $scope.prevResult = function () {
      var res = $scope.recentMovies[$scope.recentMovies.length-2];
      $scope.generate(res);
  };

// render movie if its the same as the last result basically do nothing
// rare case but can happen

  $scope.render = function(data) {
    $scope.movie = data;
    $rootScope.rate = parseInt(data.vote_average*10)/20;
    $scope.posterBg = $scope.movie.poster;
    $scope.movie.actors = [];
    if($rootScope.facebookLoggedIn) {
        $scope.onTheWatchList = $scope.watchlist.indexOf(data.id) !== -1  ? true : false; // for sho
    }
    if($scope.movie && data.title === $scope.movie.title)  {
      //$scope.hideLoading();
    } else {
      
    }
      

  // trailers
      $scope.showTrailer = false;
      $http.get('http://api.themoviedb.org/3/movie/'+data.id+'/videos?api_key=d5dc997b35ea773ef7edc72bb47dca1e').
        success(function(data){
          if(data.results[0]) {
            $scope.showTrailer = true;
            switch (data.results[0].site) {
              case 'YouTube':
                $rootScope.videoId = data.results[0].key;
               break;
            }
          } 
        });

    // credits
      $http.get('http://api.themoviedb.org/3/movie/'+data.id+'/credits?api_key=d5dc997b35ea773ef7edc72bb47dca1e').
        success(function(data){
          angular.forEach(data.crew,function(a){
            if(a.job === 'Director') {
              $scope.movie.director = a.name;
            }
          });
          angular.forEach(data.cast,function(a) {
              $scope.movie.actors.push(a.name);
          });
        });


  };


// get movie details if its from cache reach local storage otherwise call api and validate the movie


  $scope.getMovieDetails = function(num) {
    var validMovie = true;
    // todo outsource loading into a template
    $ionicLoading.show({
        template: '<ion-spinner icon="ios-small" class="spinner-energized"></ion-spinner><br />Thinking...'
    });

    if(!$scope.cachedMovieIndex || $scope.cachedMovieIndex === -1) {
      $http.get('http://api.themoviedb.org/3/movie/'+num+'?api_key=d5dc997b35ea773ef7edc72bb47dca1e').
        success(function(data){

          if(data.adult === true || data.status.toLowerCase() !== 'released') { 
            validMovie=false;
            var lastIndex = $scope.recentMovies.length-1;
            $scope.recentMovies.splice(lastIndex, 1);
            localStorage.setItem('movies.recent', angular.toJson($scope.recentMovies));
            $scope.generate();
          }
          if(validMovie) {    


            $scope.movie = {
              id: data.id,
              title: data.title,
              released: data.release_date.substr(0,4),
              genres: data.genres,
              overview: data.overview,
              countries: data.production_countries,
              otitle: data.original_title,
              votes: data.vote_count,
              poster: data.poster_path === null ? 'images/empty.png': 'https://image.tmdb.org/t/p/w396'+data.poster_path,  // original, 396, 185
              posterTn: data.poster_path === null ? 'images/empty_tn.png' : 'https://image.tmdb.org/t/p/w185'+data.poster_path,  // original, 396, 185
              posterSn: data.poster_path === null ? 'images/empty_tn.png' : 'https://image.tmdb.org/t/p/w75'+data.poster_path,  // original, 396, 185
              actors: []
            };

            $scope.recentMoviesDetails.unshift($scope.movie);    
            localStorage.setItem('movies.recentDetailed', angular.toJson($scope.recentMoviesDetails));
            $scope.render($scope.movie);
          }

        }).
        error(function(data, status){
          $log.log(data, status);  
          $scope.generate();
        });
    } else {
      $scope.render($scope.recentMoviesDetails[$scope.cachedMovieIndex],true);
    }
  };    

  

// random number generation if its already in the localstorage
// make sure the result will coming from cache.

  $scope.generate = function(r) { 
    var ran = Math.floor((Math.random() * $rootScope.results.length)),
        res = r || $rootScope.results[ran];
        
    $ionicScrollDelegate.$getByHandle('detailsContainer').scrollTop();

    $scope.cachedMovieIndex = $scope.recentMovies.indexOf(res);
    if($scope.cachedMovieIndex !== -1) {

      var movieData = $scope.recentMoviesDetails[$scope.cachedMovieIndex];
      $scope.recentMoviesDetails.splice($scope.cachedMovieIndex, 1);
      $scope.recentMovies.splice($scope.cachedMovieIndex, 1);
      $scope.recentMoviesDetails.unshift(movieData);
      localStorage.setItem('movies.recentDetailed', angular.toJson($scope.recentMoviesDetails));
    }

    $scope.recentMovies.unshift(res);    
    localStorage.setItem('movies.recent', angular.toJson($scope.recentMovies));
    $scope.getMovieDetails(res);
  };

  $scope.getData = function(page) {
      var i = page || $rootScope.dataIterator,
          maxpages = $rootScope.maxpages,
          initialpages = $rootScope.initialpages;

      $http.get($scope.qs).success(function(data){
            if(i===0) {
              maxpages = data.total_pages <= maxpages ? data.total_pages : maxpages;
              initialpages = maxpages <= initialpages ? maxpages-1 : initialpages;
            }
            //$log.log(data.results);

            if(i<maxpages) {
              
              angular.forEach(data.results,function(obj){
                $rootScope.results.push(obj.id);
              });
                
              if(i===initialpages) {
                $scope.generate();
              }
              $rootScope.dataIterator++;
              $scope.qs = $scope.oqs;
              $scope.qs += '&page='+$rootScope.dataIterator;
              $scope.getData($rootScope.dataIterator); // keep requesting

            } else if(i===maxpages) {
              // $log.log(data);
              // $log.log('.calculation done: '+maxpages);
              // $log.log($rootScope.results);
            }
      }).
      error(function(data,status) {
        if(i<=initialpages) {
          $ionicLoading.show({
            template: '<button ng-click="getData('+i+');" class="button button-icon ion-ios-refresh button-clear error"></button><a href="#/app/home" ng-click="hideLoading()" class="button button-icon ion-ios-home button-clear error"></a><br />Something went wrong.<br />Please try again.'
          });
        } else {
          $log.log('something is wrong try again' + status);
        }
      });
  };


  $scope.queryString = function() {
      var localGenres = angular.fromJson(localStorage.getItem('filters.selectedGenres')),
            //localLanguages = angular.fromJson(localStorage.getItem('filters.selected_languages')),
            fromDate = localStorage.getItem('filters.fromDate'),
            toDate = localStorage.getItem('filters.toDate'),
            popular = localStorage.getItem('filters.popular'); // not yet used and developed
            

      $scope.qs = ''; // query string base


      if(localGenres !== null) {
        $scope.qs += '&with_genres='; 
        var idx = 0;
        angular.forEach(localGenres, function(l,m){
          if(idx!==0 && l!==false) {
            $scope.qs += '|'; // | or , and
          }
          if(l!==false) {
            $scope.qs += m;
          }
          idx++;
        });
      }
    /*  
      if(localLanguages !== null) {
        $scope.localLanguages = localLanguages;
      }
    */
      if(fromDate !== null){
        $scope.qs += '&primary_release_date.gte='+fromDate;
        if (toDate === null) {
          $scope.qs += '&primary_release_date.lte='+$rootScope.tomorrow;    
        }
      } 
      if (toDate !== null) {
        $scope.qs += '&primary_release_date.lte='+toDate;
      }   


      if($scope.qs === '' && popular === true) {
        $scope.qs = 'http://api.themoviedb.org/3/movie/popular?api_key=d5dc997b35ea773ef7edc72bb47dca1e';
      } else {  
        $scope.qs = 'http://api.themoviedb.org/3/discover/movie?api_key=d5dc997b35ea773ef7edc72bb47dca1e'+$scope.qs;
      }

      $scope.oqs = $scope.qs;
  };


  $scope.init = function() {
    var firstTime = false,
        movieData, filterChange = false;

    if(!$rootScope.alreadyInitialized) {
      $rootScope.alreadyInitialized = true;
      firstTime = true;
    }

    $scope.queryString();
    
    if($rootScope.storageChanged) {
      $rootScope.storageChanged = false;
      filterChange = true;
      $rootScope.loading=true;
      $scope.movie = {};
      $rootScope.results = [];

      $ionicLoading.show({
        template: '<ion-spinner icon="ios-small" class="spinner-energized"></ion-spinner><br />Loading...'
      });
    }

    if (!firstTime && !$stateParams.movieId && !filterChange) { // i was here before so i generated a movie before I want to show that specific movie.
      $log.log('if 1');
      movieData = $scope.recentMoviesDetails[$rootScope.actualMovieIndex];
      $scope.render(movieData,true);
    } else if($stateParams.movieId) {
      
      var movieId = parseInt($stateParams.movieId, 10),
          ai = $scope.recentMovies.indexOf(movieId),
          index;

      if(ai === -1) {
          index = $scope.watchlist.indexOf(movieId);
          movieData = $scope.watchlistDetails[index];
          $scope.recentMoviesDetails.push(movieData);
          $scope.recentMovies.push(movieId);
          localStorage.setItem('movies.recentDetailed', angular.toJson($scope.recentMoviesDetails));   
          localStorage.setItem('movies.recent', angular.toJson($scope.recentMovies));
      } else {
          index = ai;
          movieData = $scope.recentMoviesDetails[index];
      }

      $scope.render(movieData,true);
      $rootScope.actualMovieIndex = index;
    } else {
      $log.log('if 4');
      $rootScope.actualMovieIndex = 0;
      $scope.getData();
    }
  };

  $scope.$on('$ionicView.enter', function(){
    $scope.init();
  });
    
  
});
