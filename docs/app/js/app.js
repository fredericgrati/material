var DocsApp = angular.module('docsApp', ['ngMaterial', 'ngRoute', 'angularytics'])

.config([
  'COMPONENTS',
  '$routeProvider',
function(COMPONENTS, $routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'template/home.tmpl.html'
  });
  $routeProvider.when('/layout/cells', {
    templateUrl: 'template/layout-cells.tmpl.html'
  });
  $routeProvider.when('/layout/grid', {
    templateUrl: 'template/layout-grid.tmpl.html'
  });

  angular.forEach(COMPONENTS, function(component) {

    component.url = '/' + component.id;

    angular.forEach(component.docs, function(doc) {
      doc.url = component.url + '/' + doc.docType + '/' + doc.name;
      $routeProvider.when(doc.url, {
        templateUrl: doc.outputPath,
        resolve: {
          component: function() { return component; },
          doc: function() { return doc; }
        },
        controller: 'ComponentDocCtrl'
      });
    });

  });

  $routeProvider.otherwise('/');

}])

.config(['AngularyticsProvider',
function(AngularyticsProvider) {
  AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
}])

.run([
  'Angularytics',
  '$rootScope',
function(Angularytics, $rootScope) {
  Angularytics.init();
}])

.controller('DocsCtrl', [
  '$scope',
  'COMPONENTS',
  '$materialSidenav',
  '$timeout',
  '$location',
  '$rootScope',
  '$materialDialog',
function($scope, COMPONENTS, $materialSidenav, $timeout, $location, $rootScope, $materialDialog) {
  $scope.COMPONENTS = COMPONENTS;
  $scope.path = function() {
    return $location.path();
  };

  $scope.setCurrentComponent = function(component, doc) {
    $scope.currentComponent = component;
    $scope.currentDoc = doc;
  };

  $scope.toggleMenu = function() {
    $timeout(function() {
      $materialSidenav('left').toggle();
    });
  };

  //Make sure a component's menu is open if the
  //url changes to match it
  $scope.$watch(function() {
    return $location.path();
  }, function(path) {
    angular.forEach(COMPONENTS, function(component) {
      if ($location.path().indexOf(component.id) > -1) {
        component.$selected = true;
      }
    });
  });

  $scope.goHome = function($event) {
    $location.path( '/' );
  };

  $scope.goToDoc = function(doc) {
    $location.path(doc.url);
  };

  $scope.docIsCurrent = function(doc) {
    return $location.path() === doc.url;
  };

  $scope.viewSource = function(component, $event) {
    $materialDialog({
      targetEvent: $event,
      controller: 'ViewSourceCtrl',
      locals: {
        demo: component.$selectedDemo
      },
      templateUrl: 'template/view-source.tmpl.html'
    });
  };
}])

.controller('HomeCtrl', [
  '$scope',
  '$rootScope',
function($scope, $rootScope) {
  $rootScope.appTitle = 'Material Design';
  $scope.setCurrentComponent({
    name: 'Material Design'
  });
}])

.controller('LayoutCtrl', [
  '$scope',
  '$rootScope',
  '$attrs',
function($scope, $rootScope, $attrs) {
  $rootScope.appTitle = $attrs.demoTitle;
  $scope.setCurrentComponent({
    name: $attrs.demoTitle
  });
}])

.controller('ComponentDocCtrl', [
  '$scope',
  'doc',
  'component',
  '$rootScope',
function($scope, doc, component, $rootScope) {
  $scope.setCurrentComponent(component, doc);
  $scope.doc = doc;
  $rootScope.appTitle = 'Material: ' + doc.name;
}])

.controller('ViewSourceCtrl', [
  '$scope',
  'demo',
  '$hideDialog',
function($scope, demo, $hideDialog) {
  $scope.files = [demo.indexFile].concat(demo.files.sort(sortByJs));
  $scope.$hideDialog = $hideDialog;

  $scope.data = {
    selectedFile: demo.indexFile
  };

  function sortByJs(file) {
    return file.fileType == 'js' ? -1 : 1;
  }
}])

;
