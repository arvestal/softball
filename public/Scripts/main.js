// main.js
var app = angular.module('myApp', ['ngGrid']);
app.controller('MyCtrl', function ($scope, statsService) {

    //$scope.careerData = [{ id: 1, department: 'DEV-HRIT', name: 'Andrew Clauss' }, { id: 2, department: 'Team Sunshine', name: 'Jolie Gayles' }, { id: 3, department: 'Freezing Cold Iowa', name: 'Jason Hicok' }
    //    , { id: 4, department: 'DEV-HRIT', name: 'Rajesh Venktaraman' }, { id: 5, department: 'DEV-HRIT', name: 'Devin Ezell' }, { id: 6, department: 'DEV-HRIT', name: 'Allen Vestal' }];

    $scope.ps = { wins: 0, losses: 2 };
    $scope.winter15 = { wins: 6, losses: 6, ties: 0 };
    $scope.fall14 = { wins: 8, losses: 4, ties: 2 };
    $scope.summer14 = { wins: 8, losses: 5, ties: 1 };

    $scope.columnDefs = [{ field: 'Id', displayName: '#', width: 35, cellClass: 'grid-align-right' }, { field: 'department', width: 150 }, { field: 'name', width: 150 }]

    $scope.gridCareerOptions = {
        data: 'careerData',
        sortInfo: { fields: ['Id'], directions: ['desc'] },
        columnDefs: 'columnDefs'
    };

    loadRemoteData();

    function applyRemoteData(refreshStats) {

        $scope.careerData = refreshStats;

    }

    function loadRemoteData() {

        // The statsService returns a promise.
        statsService.getStats()
            .then(
                function (careerData) {

                    applyRemoteData(careerData);

                });
        }
});


app.service("statsService", function ($http, $q) {

    // Return public API.
    return ({ getStats: getStats });

    // I get all of the friends in the remote collection.
    function getStats() {
        var request = $http({
            method: "get",
            url: "api/user",
            params: { action: "get" },
            cache: false
        });

        return (request.then(handleSuccess, handleError));
    }

    // I transform the error response, unwrapping the application dta from
    // the API response payload.
    function handleError(response) {

        // The API response from the server should be returned in a
        // nomralized format. However, if the request was not handled by the
        // server (or what not handles properly - ex. server error), then we
        // may have to normalize it on our end, as best we can.
        if (
            !angular.isObject(response.data) ||
            !response.data.message
            ) {

            return ($q.reject("An unknown error occurred."));

        }

        // Otherwise, use expected error message.
        return ($q.reject(response.data.message));

    }


    // I transform the successful response, unwrapping the application data
    // from the API response payload.
    function handleSuccess(response) {

        return (response.data);
    }

});