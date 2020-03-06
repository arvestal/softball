/*
    when adding a new season, you need to do the following:
    1. update app.js: get stats, gridoptions, standings, route provider
    2. Update Index page
    3. copy current season stats to career.html
    4. update apis: career, standings
*/


function gridOptions(data) {
    return {
        data: data,
        sortInfo: { fields: ['AVG'], directions: ['desc'] },
        columnDefs: 'columnDefs',
    };
}

angular.module('myApp', ['ngGrid', 'ngRoute'])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/career.html',
                controller: 'MyCtrl',
            })
            .when('/postseason', {
                templateUrl: 'partials/postseason.html',
                controller: 'MyCtrl',
            })
            .when('/winter20', {
                templateUrl: 'partials/winter20.html',
                controller: 'MyCtrl',
            })
            .when('/fall19', {
                templateUrl: 'partials/fall19.html',
                controller: 'MyCtrl',
            })
            .when('/spring19', {
                templateUrl: 'partials/spring19.html',
                controller: 'MyCtrl',
            })
            .when('/fall18', {
                templateUrl: 'partials/fall18.html',
                controller: 'MyCtrl',
            })
            .when('/summer18', {
                templateUrl: 'partials/summer18.html',
                controller: 'MyCtrl',
            })
            .when('/spring18', {
                templateUrl: 'partials/spring18.html',
                controller: 'MyCtrl',
            })
            .when('/winter18', {
                templateUrl: 'partials/winter18.html',
                controller: 'MyCtrl',
            })
            .when('/fall17', {
                templateUrl: 'partials/fall17.html',
                controller: 'MyCtrl',
            })
            .when('/summer17', {
                templateUrl: 'partials/summer17.html',
                controller: 'MyCtrl',
            })
            .when('/spring17', {
                templateUrl: 'partials/spring17.html',
                controller: 'MyCtrl',
            })
            .when('/winter17', {
                templateUrl: 'partials/winter17.html',
                controller: 'MyCtrl',
            })
            .when('/fall16', {
                templateUrl: 'partials/fall16.html',
                controller: 'MyCtrl',
            })
            .when('/summer16', {
                templateUrl: 'partials/summer16.html',
                controller: 'MyCtrl',
            })
            .when('/spring16', {
                templateUrl: 'partials/spring16.html',
                controller: 'MyCtrl',
            })
            .when('/winter16', {
                templateUrl: 'partials/winter16.html',
                controller: 'MyCtrl',
            })
            .when('/fall15', {
                templateUrl: 'partials/fall15.html',
                controller: 'MyCtrl',
            })
            .when('/summer15', {
                templateUrl: 'partials/summer15.html',
                controller: 'MyCtrl',
            })
            .when('/spring15', {
                templateUrl: 'partials/spring15.html',
                controller: 'MyCtrl',
            })
            .when('/winter15', {
                templateUrl: 'partials/winter15.html',
                controller: 'MyCtrl',
            })
            .when('/fall14', {
                templateUrl: 'partials/fall14.html',
                controller: 'MyCtrl',
            })
            .when('/summer14', {
                templateUrl: 'partials/summer14.html',
                controller: 'MyCtrl',
            })
            .when('/coed', {
                templateUrl: 'partials/coed.html',
                controller: 'MyCtrl',
            })
            .otherwise({
                redirectTo: '/',
            });
    })
    .controller('MyCtrl', function ($scope, $http) {
        
        $http.get('/api/career')
            .success(data => {
                const filter = data.filter(item => [99,1,2,3,6,10,12,15,16,19,23,24,25,28,36,37,40,43,46,47,48,50,53,59,67,70,80,83,110].includes(+item.id))
                $scope.careerData = filter;
            })
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=postseason')
            .success(data => {
                const filter = data.filter(item => [1,2,3,6,10,12,15,16,19,23,24,25,28,35,36,40,43,46,47,48,50,53,70,80,83,110].includes(+item.id))
                $scope.postSeasonData = filter;
            })
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=17fall')
            .success(data => $scope.fall17Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=18winter')
            .success(data => $scope.winter18Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=18spring')
            .success(data => $scope.spring18Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=18summer')
            .success(data => $scope.summer18Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=18fall')
            .success(data => $scope.fall18Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=19spring')
            .success(data => $scope.spring19Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=19fall')
            .success(data => $scope.fall19Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=20winter')
            .success(data => $scope.winter20Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=17summer')
            .success(data => $scope.summer17Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=17spring')
            .success(data => $scope.spring17Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=17winter')
            .success(data => $scope.winter17Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=16fall')
            .success(data => $scope.fall16Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=16summer')
            .success(data => $scope.summer16Data = data)
            .error(data => console.log(`Error: ${data}`));
        
        $http.get('/api/stats?season=16spring')
            .success(data => $scope.spring16Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=16winter')
            .success(data => $scope.winter16Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=15fall')
            .success(data => $scope.fall15Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=15summer')
            .success(data => $scope.summer15Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=15spring')
            .success(data => $scope.spring15Data = data)
            .error(data => console.log(`Error: ${data}`));
        
        $http.get('/api/stats?season=15winter')
            .success(data => $scope.winter15Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=14fall')
            .success(data => $scope.fall14Data = data)
            .error(data => console.log(`Error: ${data}`));

        $http.get('/api/stats?season=14summer')
            .success(data => $scope.summer14Data = data)
            .error(data => console.log(`Error: ${data}`));
        
        $http.get('/api/standings')
            .success(data => {
                let { postseason, fall17, summer17,
                    spring17, winter17, fall16, summer16,
                    spring16, winter16, fall15, summer15,
                    spring15, winter15, fall14, summer14,
                    winter18, spring18, summer18, fall18, spring19, fall19, winter20 } = data;

                $scope.ps = postseason;
                $scope.winter20 = winter20;
                $scope.fall19 = fall19;
                $scope.spring19 = spring19;
                $scope.fall18 = fall18;
                $scope.summer18 = summer18;
                $scope.spring18 = spring18;
                $scope.winter18 = winter18,
                    $scope.fall17 = fall17;
                $scope.summer17 = summer17;
                $scope.spring17 = spring17;
                $scope.winter17 = winter17;
                $scope.fall16 = fall16;
                $scope.summer16 = summer16;
                $scope.spring16 = spring16;
                $scope.winter16 = winter16;
                $scope.fall15 = fall15;
                $scope.summer15 = summer15;
                $scope.spring15 = spring15;
                $scope.winter15 = winter15;
                $scope.fall14 = fall14;
                $scope.summer14 = summer14;
            })
            .error(data => console.log(`Error: ${data}`));

        $scope.gridCareerOptions = gridOptions('careerData');
        $scope.gridPostSeasonOptions = gridOptions('postSeasonData');

        $scope.gridWinter20Options = gridOptions('winter20Data');
        $scope.gridFall19Options = gridOptions('fall19Data');
        $scope.gridSpring19Options = gridOptions('spring19Data');
        $scope.gridFall18Options = gridOptions('fall18Data');
        $scope.gridSummer18Options = gridOptions('summer18Data');
        $scope.gridSpring18Options = gridOptions('spring18Data');
        $scope.gridWinter18Options = gridOptions('winter18Data');
        $scope.gridFall17Options = gridOptions('fall17Data');
        $scope.gridSummer17Options = gridOptions('summer17Data');
        $scope.gridSpring17Options = gridOptions('spring17Data');
        $scope.gridWinter17Options = gridOptions('winter17Data');
        $scope.gridFall16Options = gridOptions('fall16Data');
        $scope.gridSummer16Options = gridOptions('summer16Data');
        $scope.gridSpring16Options = gridOptions('spring16Data');
        $scope.gridWinter16Options = gridOptions('winter16Data');
        $scope.gridFall15Options = gridOptions('fall15Data');
        $scope.gridSummer15Options = gridOptions('summer15Data');
        $scope.gridSpring15Options = gridOptions('spring15Data');
        $scope.gridWinter15Options = gridOptions('winter15Data');
        $scope.gridFall14Options = gridOptions('fall14Data');
        $scope.gridSummer14Options = gridOptions('summer14Data');

        $scope.columnDefs = [{ field: 'id', displayName: '#', width: 35, cellClass: 'grid-align-right' }, 
        { field: 'Lastname', displayName: 'Name', width: 150 },
        { field: 'GP', width: 35, cellClass: 'grid-align-right' }, 
        { field: 'PA', width: 35, cellClass: 'grid-align-right' },
        { field: 'AB', width: 35, cellClass: 'grid-align-right' }, 
        { field: 'H', width: 35, cellClass: 'grid-align-right' },
        { field: 'S', displayName: '1B', width: 35, cellClass: 'grid-align-right' }, 
        { field: 'D', displayName: '2B', width: 35, cellClass: 'grid-align-right' },
        { field: 'T', displayName: '3B', width: 35, cellClass: 'grid-align-right' }, 
        { field: 'HR', width: 35, cellClass: 'grid-align-right' },
        { field: 'RBI', width: 40, cellClass: 'grid-align-right' }, 
        { field: 'R', width: 35, cellClass: 'grid-align-right' },
        { field: 'TB', width: 35, cellClass: 'grid-align-right' }, 
        { field: 'BB', width: 35, cellClass: 'grid-align-right' },
        { field: 'SAC', width: 40, cellClass: 'grid-align-right' }, 
        { field: 'FC', width: 35, cellClass: 'grid-align-right' },
        { field: 'K', width: 35, cellClass: 'grid-align-right' }, 
        { field: 'AVG', width: 60, cellFilter: 'number:3' },
        { field: 'OBP', width: 60, cellFilter: 'number:3' }, 
        { field: 'SLG', width: 60, cellFilter: 'number:3' }, 
        { field: 'OPS', width: 60, cellFilter: 'number:3' }];
    });