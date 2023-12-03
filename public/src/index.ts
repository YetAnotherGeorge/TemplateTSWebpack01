import angular from "angularjs-ts";



async function AppController($scope: angular.IScope): Promise<void> {
   $scope.$on("$destroy", (_) => {
      console.log("Controller Destroyed");
      // TODO
   });

   console.log("Hello from AppController");
}

async function Main(): Promise<void> {
   let app: angular.IModule = angular.module("MainApp", []);
   app.controller("AppController", ["$scope", AppController]);
}
Main();
