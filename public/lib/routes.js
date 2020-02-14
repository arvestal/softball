const express = require("express");
const router = express.Router();
const stats = require("./build-stats");
const axios = require('axios');

router.get("/stats", (request, response) => {
  const season = request.query['season'];
  const csvFile = `${__dirname}/gc_files/${season}.csv`;
  stats.convertToJson(csvFile).then(data => {
    response.json(data);
  });
});

router.get("/career", (request, response) => {

  function getSeasonData(season) {
    return axios.get(`http://localhost:8080/api/stats?season=${season}`);
  }
  
  axios.all([getSeasonData('17fall'), getSeasonData('18fall'), getSeasonData('19fall'), getSeasonData('18spring'), getSeasonData('19spring')
    , getSeasonData('18winter'), getSeasonData('20winter'), getSeasonData('18summer'), getSeasonData('postseason'), getSeasonData('14summer')
    , getSeasonData('15summer'), getSeasonData('16summer'), getSeasonData('17summer')
    , getSeasonData('14fall'), getSeasonData('15fall'), getSeasonData('16fall')
    , getSeasonData('15winter'), getSeasonData('16winter'), getSeasonData('17winter')
    , getSeasonData('15spring'), getSeasonData('16spring'), getSeasonData('17spring')
  
  ])
    .then(axios.spread(function (fall17, fall18, fall19, spring18, spring19, winter18, winter20, summer18, postseason, summer14
      , summer15, summer16, summer17, fall14, fall15, fall16, winter15, winter16, winter17, spring15, spring16, spring17) {
      
      const careerData = [].concat(
        fall19.data, winter20.data
        , summer18.data, fall18.data, spring19.data
        , summer17.data, fall17.data, winter18.data, spring18.data
        , summer16.data, fall16.data, winter17.data, spring17.data
        , summer15.data, fall15.data, winter16.data, spring16.data 
        , summer14.data, fall14.data, winter15.data, spring15.data
        , postseason.data
        );
  
        const careerAggregated = careerData.reduce((acc, row) => {
          const filtered = acc.filter(item => +item.id === +row.id);
          
          if(filtered.length > 0){
            acc[acc.indexOf(filtered[0])].GP += +row.GP;
            acc[acc.indexOf(filtered[0])].PA += +row.PA;
            acc[acc.indexOf(filtered[0])].AB += +row.AB;
            acc[acc.indexOf(filtered[0])].H += +row.H;
            acc[acc.indexOf(filtered[0])].S += +row.S;
            acc[acc.indexOf(filtered[0])].D += +row.D;
            acc[acc.indexOf(filtered[0])].T += +row.T;
            acc[acc.indexOf(filtered[0])].HR += +row.HR;
            acc[acc.indexOf(filtered[0])].RBI += +row.RBI;
            acc[acc.indexOf(filtered[0])].R += +row.R;
            acc[acc.indexOf(filtered[0])].FC += +row.FC;
            acc[acc.indexOf(filtered[0])].BB += +row.BB;
            acc[acc.indexOf(filtered[0])].K += +row.K;
            acc[acc.indexOf(filtered[0])].SAC += +row.SAC;
            acc[acc.indexOf(filtered[0])].TB += +row.TB;
          } else {
            // only include these players for season stats
            //if ([1,2,3,6,12,15,16,19,23,24,25,28,40,46,47,48,53,70,80,83,110].includes(+row.id)) {
              acc.push(row);
            //}
          }
         
          return acc;
        }, []);
        
        const stats = careerAggregated.map(data => {
        
          const {id, Lastname, GP, PA, AB, H, S, D, T, HR, RBI, R, FC, BB, K, SAC, TB} = data;
          const statsParsed = {
            id, Lastname, GP, PA, AB, H, S, D, T, HR, RBI, R, FC, BB, K, SAC,
            AVG: H / AB,
            OBP: (H + BB) / (AB + BB + SAC),
            QAB: ((H - S) + H + BB + SAC) / AB,
            SLG: TB / AB,
            OPS: ((H + BB) / (AB + BB + SAC)) + (TB / AB),
            TB
          }
        
          return statsParsed;
        })
  
        response.json(stats);
    }));
});

router.get("/standings", (request, response) => {
  const results = {
    postseason: { wins: 18, losses: 16 },
    winter20: {
      season: 'Winter',
      year: 2020, 
      wins: 6, 
      losses: 2, 
      ties: 0,
      schedule: [{time: 'Wed, Jan 15 @ 6:30pm', team: 'We Are Twelve', runs: 0, oppRuns: 0, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B'}
        , {time: 'Wed, Jan 15 @ 7:30pm', team: 'Arena Sports Grill', runs: 16, oppRuns: 13, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Jan 22 @ 6:30pm', team: 'Hey Cuz', runs: 11, oppRuns: 5, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Jan 22 @ 7:30pm', team: 'Arena Sports Grill', runs: 13, oppRuns: 3, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Jan 29 @ 8:30pm', team: 'We Are Twelve', runs: 0, oppRuns: 0, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Jan 29 @ 9:30pm', team: 'We Are Twelve', runs: 0, oppRuns: 0, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Feb 5 @ 8:30pm', team: 'Hey Cuz', runs: 15, oppRuns: 16, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Feb 5 @ 9:30pm', team: 'Arena Sports Grill', runs: 6, oppRuns: 15, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Feb 19 @ 6:30pm', team: 'Hey Cuz', runs: 0, oppRuns: 0, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Feb 19 @ 8:30pm', team: 'Arena Sports Grill', runs: 0, oppRuns: 0, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Feb 26 @ 6:30pm', team: 'Arena Sports Grill', runs: 0, oppRuns: 0, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Feb 26 @ 7:30pm', team: 'Hey Cuz', runs: 0, oppRuns: 0, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Mar 4 @ 6:30pm', tpRuns: 0, eam: 'TBD', runs: 0, location: '', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
      ]
    },
    fall19: { 
      season: 'Fall',
      year: 2019,
      wins: 12, 
      losses: 2, 
      ties: 0, 
      schedule: [{time: 'Wed, Sept 11 @ 8:30pm', team: 'Balco Bombers', runs: 18, oppRuns: 11, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B'}
        , {time: 'Wed, Sept 11 @ 9:30pm', team: 'Outlaws', runs: 10, oppRuns: 2, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Sept 18 @ 8:30pm', team: 'Bunt Blasters', runs: 14, oppRuns: 11, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Sept 18 @ 9:30pm', team: '99 Problems', runs: 22, oppRuns: 3, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Sept 25 @ 6:30pm', team: 'Outlaws', runs: 21, oppRuns: 5, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Sept 25 @ 7:30pm', team: '99 Problems', runs: 7, oppRuns: 25, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 2 @ 7:30pm', team: 'Los Cacahuetes', runs: 12, oppRuns: 2, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 2 @ 8:30pm', team: 'Los Cacahuetes', runs: 20, oppRuns: 9, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 9 @ 6:30pm', team: 'Cruisers', runs: 24, oppRuns: 4, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 9 @ 7:30pm', team: 'Misfits', runs: 26, oppRuns: 3, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 16 @ 6:30pm', team: 'Hey Cuz', runs: 23, oppRuns: 9, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 16 @ 7:30pm', team: 'Bunt Blasters', runs: 15, oppRuns: 2, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 23 @ 6:30pm', team: 'Hey Cuz', runs: 10, oppRuns: 13, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 23 @ 7:30pm', team: 'Arena Sports Grill', runs: 11, oppRuns: 8, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 30 @ 6:30pm', team: 'Arena Sports Grill', runs: 4, oppRuns: 7, location: 'home', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
        , {time: 'Wed, Oct 30 @ 7:30pm', team: 'Arena Sports Grill', runs: 15, oppRuns: 0, location: 'away', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
        , {time: 'Wed, Oct 30 @ 8:30pm', team: 'Arena Sports Grill', runs: 11, oppRuns: 5, location: 'away', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
     ]
    },
    spring19: {
      season: 'Spring',
      year: 2019, 
      wins: 10,
      losses: 3,
      ties: 1,
      schedule: [{time: 'Wed, Mar 20 @ 6:30pm', team: 'Hey Cuz', runs: 18, oppRuns: 17, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B'}
        , {time: 'Wed, Mar 20 @ 6:30pm', team: 'Hey Cuz', runs: 34, oppRuns: 7, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Mar 27 @ 8:30pm', team: 'Fat Elgerts', runs: 21, oppRuns: 7, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Mar 27 @ 9:30pm', team: 'Misfits', runs: 13, oppRuns: 3, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 3 @ 6:30pm', team: 'Arena Sports Grill', runs: 13, oppRuns: 15, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 3 @ 7:30pm', team: 'Arena Sports Grill', runs: 12, oppRuns: 17, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 10 @ 8:30pm', team: 'Misfits', runs: 13, oppRuns: 6, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 10 @ 9:30pm', team: 'Victor\'s Secret', runs: 19, oppRuns: 8, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 17 @ 6:30pm', team: 'Balco Bombers', runs: 13, oppRuns: 8, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 17 @ 7:30pm', team: 'JFQ-Huks', runs: 0, oppRuns: 0, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 24 @ 6:30pm', team: 'JFQ-Huks', runs: 0, oppRuns: 0, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 24 @ 7:30pm', team: 'Hey Cuz', runs: 10, oppRuns: 11, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 1 @ 8:30pm', team: 'Arena Sports Grill', runs: 13, oppRuns: 13, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 1 @ 9:30pm', team: 'JFQ-Huks', runs: 0, oppRuns: 0, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 15 @ 7:30pm', team: 'Victor\'s Secret', runs: 14, oppRuns: 4, location: 'home', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
        , {time: 'Wed, May 15 @ 8:30pm', team: 'Hey Cuz', runs: 12, oppRuns: 18, location: 'away', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
      ]
    },
    fall18: { 
      season: 'Fall',
      year: 2018,
      wins: 5, 
      losses: 5, 
      ties: 0,
      schedule: [{time: 'Wed, Sept 12 @ 6:30pm', team: 'Thirsty Camels', runs: 18, oppRuns: 3, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B'}
        , {time: 'Wed, Sept 12 @ 7:30pm', team: 'Thirsty Camels', runs: 14, oppRuns: 13, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Sept 26 @ 8:30pm', team: 'Hey Cuz', runs: 12, oppRuns: 20, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Sept 26 @ 9:30pm', team: 'Hey Cuz', runs: 10, oppRuns: 20, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 10 @ 6:30pm', team: 'Arena Sports Grill', runs: 13, oppRuns: 12, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 10 @ 7:30pm', team: 'Arena Sports Grill', runs: 14, oppRuns: 13, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 17 @ 6:30pm', team: 'Balco Bombers', runs: 19, oppRuns: 1, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 17 @ 7:30pm', team: 'Thirsty Camels', runs: 11, oppRuns: 17, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 24 @ 8:30pm', team: 'Arena Sports Grill', runs: 7, oppRuns: 21, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Oct 24 @ 9:30pm', team: 'Hey Cuz', runs: 24, oppRuns: 32, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Nov 14 @ 7:30pm', team: 'Arena Sports Grill', runs: 15, oppRuns: 16, location: 'away', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
     ] 
    },
    summer18: { 
      season: 'Summer',
      year: 2018,
      wins: 8, 
      losses: 3, 
      ties: 1,
      schedule: [{time: 'Wed, June 6 @ 8:30pm', team: '99 Problems', runs: 17, oppRuns: 1, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B'}
        , {time: 'Wed, June 6 @ 9:30pm', team: '99 Problems', runs: 14, oppRuns: 12, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 13 @ 8:30pm', team: 'Outlaws', runs: 11, oppRuns: 9, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 13 @ 9:30pm', team: 'Outlaws', runs: 25, oppRuns: 11, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 20 @ 6:30pm', team: 'Arena Sports Grill', runs: 17, oppRuns: 18, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 20 @ 7:30pm', team: 'Arena Sports Grill', runs: 18, oppRuns: 14, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 27 @ 6:30pm', team: 'Hey Cuz', runs: 14, oppRuns: 13, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 27 @ 7:30pm', team: 'Hey Cuz', runs: 10, oppRuns: 15, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 18 @ 8:30pm', team: 'Arena Sports Grill', runs: 8, oppRuns: 8, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 18 @ 9:30pm', team: 'Thirsty Camels', runs: 8, oppRuns: 14, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 25 @ 8:30pm', team: 'Thirsty Camels', runs: 13, oppRuns: 7, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 25 @ 9:30pm', team: 'Arena Sports Grill', runs: 18, oppRuns: 10, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Aug 1 @ 8:30pm', team: 'Arena Sports Grill', runs: 18, oppRuns: 17, location: 'home', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
        , {time: 'Wed, Aug 1 @ 9:30pm', team: 'Thirsty Camels', runs: 15, oppRuns: 6, location: 'home', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
     ]
    },
    spring18: { 
      season:'Spring',
      year: 2018,
      wins: 8, 
      losses: 6, 
      ties: 0,
      schedule : [{time: 'Wed, Mar 21 @ 8:30pm', team: '99 Problems', runs: 13, oppRuns: 5, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B'}
        , {time: 'Wed, Mar 21 @ 9:30pm', team: '99 Problems', runs: 17, oppRuns: 9, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Mar 28 @ 6:30pm', team: 'Hey Cuz', runs: 6, oppRuns: 12, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Mar 28 @ 7:30pm', team: 'Hey Cuz', runs: 17, oppRuns: 5, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 4 @ 8:30pm', team: 'Manday', runs: 10, oppRuns: 5, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 4 @ 9:30pm', team: 'Manday', runs: 12, oppRuns: 15, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 11 @ 8:30pm', team: 'Arena Sports Grill', runs: 11, oppRuns: 5, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 11 @ 9:30pm', team: 'Arena Sports Grill', runs: 13, oppRuns: 23, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 18 @ 7:30pm', team: 'Thirsty Camels', runs: 9, oppRuns: 12, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 18 @ 8:30pm', team: 'Arena Sports Grill', runs: 16, oppRuns: 13, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 25 @ 7:30pm', team: 'Manday', runs: 16, oppRuns: 7, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 25 @ 8:30pm', team: 'Thirsty Camels', runs: 12, oppRuns: 14, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 2 @ 7:30pm', team: 'Arena Sports Grill', runs: 16, oppRuns: 8, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 2 @ 7:30pm', team: 'Hey Cuz', runs: 9, oppRuns: 15, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 9 @ 6:30pm', team: 'Manday', runs: 4, oppRuns: 3, location: 'home', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
        , {time: 'Wed, May 9 @ 7:30pm', team: 'Arena Sports Grill', runs: 13, oppRuns: 11, location: 'away', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
        , {time: 'Wed, May 9 @ 8:30pm', team: 'Thirsty Camels', runs: 10, oppRuns: 12, location: 'away', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
     ]
    },
    winter18: { 
      season: 'Winter',
      year: 2018,
      wins: 9, 
      losses: 1, 
      ties: 0,
      schedule: [{time: 'Wed, Jan 17 @ 6:30pm', team: 'Cruisers', runs: 18, oppRuns: 1, location: 'away', park: 'Horizon', gametype: 'League', level: 'C'}
        , {time: 'Wed, Jan 17 @ 7:30pm', team: 'Cruisers', runs: 14, oppRuns: 6, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 24 @ 8:30pm', team: 'Balco Bombers', runs: 15, oppRuns: 8, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 24 @ 9:30pm', team: 'Balco Bombers', runs: 16, oppRuns: 3, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 31 @ 8:30pm', team: 'Outlaws', runs: 16, oppRuns: 12, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 31 @ 9:30pm', team: 'Outlaws', runs: 21, oppRuns: 5, location: 'home', park: 'Horizon', gametype: 'League', level: 'C', notes: 'they quit LOL' }
        , {time: 'Wed, Feb 7 @ 6:30pm', team: 'Swingers', runs: 14, oppRuns: 4, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 7 @ 7:30pm', team: 'Swingers', runs: 20, oppRuns: 4, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 21 @ 6:30pm', team: 'Southern Wine & Spirits', runs: 17, oppRuns: 9, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 21 @ 7:30pm', team: 'Southern Wine & Spirits', runs: 10, oppRuns: 18, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Mar 7 @ 6:30pm', team: 'Cruisers', runs: 16, oppRuns: 1, location: 'home', park: 'Horizon', gametype: 'Postseason', level: 'C' }
        , {time: 'Wed, Mar 7 @ 7:30pm', team: 'Outlaws', runs: 13, oppRuns: 3, location: 'home', park: 'Horizon', gametype: 'Postseason', level: 'C' }
        , {time: 'Wed, Mar 7 @ 8:30pm', team: 'Southern Wine & Spirits', runs: 11, oppRuns: 4, location: 'home', park: 'Horizon', gametype: 'Postseason', level: 'C' }
      ]
     },
    fall17: { 
      season: 'Fall',
      year: 2017,
      wins: 11, 
      losses: 3, 
      ties: 0,
      schedule: [{time: 'Wed, Sept 13 @ 8:30pm', team: 'Balco Bombers', runs: 20, oppRuns: 8, location: 'away', park: 'Horizon', gametype: 'League', level: 'C'}
        , {time: 'Wed, Sept 13 @ 8:30pm', team: 'Balco Bombers', runs: 23, oppRuns: 8, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Sept 20 @ 6:30pm', team: 'Outlaws', runs: 16, oppRuns: 15, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Sept 20 @ 7:30pm', team: 'Outlaws', runs: 18, oppRuns: 15, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Sept 27 @ 8:30pm', team: 'Cruisers', runs: 13, oppRuns: 3, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Sept 27 @ 9:30pm', team: 'Cruisers', runs: 32, oppRuns: 11, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 11 @ 8:30pm', team: '99 Problems', runs: 10, oppRuns: 12, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 11 @ 9:30pm', team: '99 Problems', runs: 14, oppRuns: 16, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 18 @ 6:30pm', team: 'Arena Sports Grill - Sandsharks', runs: 0, oppRuns: 0, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 18 @ 7:30pm', team: 'Arena Sports Grill - Sandsharks', runs: 0, oppRuns: 0, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 25 @ 6:30pm', team: 'Noche Noche', runs: 19, oppRuns: 5, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 25 @ 7:30pm', team: 'Noche Noche', runs: 17, oppRuns: 11, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Nov 1 @ 6:30pm', team: 'Southern Wine & Spirits', runs: 9, oppRuns: 12, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Nov 1 @ 7:30pm', team: 'Southern Wine & Spirits', runs: 22, oppRuns: 2, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Nov 8 @ 8:30pm', team: 'Outlaws', runs: 11, oppRuns: 10, location: 'home', park: 'Thompson Peak', gametype: 'Postseason', level: 'C' }
        , {time: 'Wed, Nov 8 @ 9:30pm', team: '99 Problems', runs: 10, oppRuns: 8, location: 'away', park: 'Thompson Peak', gametype: 'Postseason', level: 'C' }
      ]
    },
    summer17: { 
      season: 'Summer',
      year: 2017,
      wins: 8, 
      losses: 6, 
      ties: 0,
      schedule: [{time: 'Wed, June 7 @ 8:30pm', team: 'Manday', runs: 1, oppRuns: 8, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B'}
        , {time: 'Wed, June 7 @ 9:30pm', team: 'Manday', runs: 7, oppRuns: 12, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 14 @ 8:30pm', team: 'Outlaws', runs: 18, oppRuns: 10, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 14 @ 9:30pm', team: 'Outlaws', runs: 18, oppRuns: 17, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 21 @ 6:30pm', team: '99 Problems', runs: 14, oppRuns: 3, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 21 @ 7:30pm', team: '99 Problems', runs: 9, oppRuns: 11, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 28 @ 8:30pm', team: 'Southern Wine & Spirits', runs: 12, oppRuns: 13, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, June 28 @ 9:30pm', team: 'Southern Wine & Spirits', runs: 12, oppRuns: 5, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 5 @ 8:30pm', team: 'Cruisers', runs: 12, oppRuns: 16, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 5 @ 9:30pm', team: 'Cruisers', runs: 22, oppRuns: 7, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 12 @ 6:30pm', team: 'Thirsty Camels', runs: 8, oppRuns: 14, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 12 @ 7:30pm', team: 'Thirsty Camels', runs: 11, oppRuns: 5, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 19 @ 6:30pm', team: 'Caught Looking', runs: 14, oppRuns: 2, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 19 @ 7:30pm', team: 'Caught Looking', runs: 24, oppRuns: 5, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, July 26 @ 7:30pm', team: 'Hey Cuz', runs: 13, oppRuns: 14, location: 'away', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
     ]
    },
    spring17: { 
      season: 'Spring',
      year: 2017,
      wins: 7, 
      losses: 8, 
      ties: 1,
      schedule: [{time: 'Wed, Mar 22 @ 8:30pm', team: 'We should be a C Team', runs: 16, oppRuns: 10, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B'}
        , {time: 'Wed, Mar 22 @ 9:30pm', team: 'We should be a C Team', runs: 10, oppRuns: 9, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Mar 29 @ 6:30pm', team: 'Cruisers', runs: 16, oppRuns: 8, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Mar 29 @ 7:30pm', team: 'Cruisers', runs: 8, oppRuns: 16, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 5 @ 7:30pm', team: 'Caught Looking', runs: 17, oppRuns: 2, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 5 @ 8:30pm', team: 'Caught Looking', runs: 11, oppRuns: 7, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 12 @ 8:30pm', team: 'Outlaws', runs: 9, oppRuns: 17, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 12 @ 9:30pm', team: 'Outlaws', runs: 24, oppRuns: 23, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 19 @ 8:30pm', team: 'Longballs', runs: 8, oppRuns: 24, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 19 @ 9:30pm', team: 'Longballs', runs: 21, oppRuns: 23, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 26 @ 8:30pm', team: 'Thirsty Camels', runs: 17, oppRuns: 21, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 26 @ 9:30pm', team: 'Thirsty Camels', runs: 16, oppRuns: 16, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 3 @ 6:30pm', team: 'Hey Cuz', runs: 7, oppRuns: 13, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 3 @ 7:30pm', team: 'Hey Cuz', runs: 9, oppRuns: 12, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 10 @ 6:30pm', team: 'Manday', runs: 14, oppRuns: 13, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 10 @ 7:30pm', team: 'Manday', runs: 14, oppRuns: 15, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 17 @ 8:30pm', team: 'Pitched Slapped', runs: 10, oppRuns: 18, location: 'home', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
     ]
    },
    winter17: { 
      season: 'Winter',
      year: 2017,
      wins: 9, 
      losses: 5, 
      ties: 0,
      schedule: [{time: 'Wed, Jan 11 @ 6:30pm', team: 'Phoenix Ale Brewery', runs: 0, oppRuns: 0, location: 'away', park: 'Horizon', gametype: 'League', level: 'C'}
        , {time: 'Wed, Jan 11 @ 7:30pm', team: 'Phoenix Ale Brewery', runs: 0, oppRuns: 0, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 18 @ 8:30pm', team: 'Cruisers', runs: 14, oppRuns: 7, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 18 @ 9:30pm', team: 'Cruisers', runs: 18, oppRuns: 20, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 1 @ 6:30pm', team: 'Henkel', runs: 24, oppRuns: 11, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 1 @ 7:30pm', team: 'Henkel', runs: 17, oppRuns: 2, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 8 @ 8:30pm', team: 'Outlaws', runs: 17, oppRuns: 20, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 8 @ 9:30pm', team: 'Outlaws', runs: 20, oppRuns: 8, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 15 @ 8:30pm', team: 'Caught Looking', runs: 15, oppRuns: 4, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 15 @ 9:30pm', team: 'Caught Looking', runs: 12, oppRuns: 17, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 22 @ 6:30pm', team: 'Knuckleballs Deep', runs: 9, oppRuns: 7, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 22 @ 7:30pm', team: 'Knuckleballs Deep', runs: 13, oppRuns: 12, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Mar 8 @ 8:30pm', team: 'Pitched Slapped', runs: 8, oppRuns: 12, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Mar 8 @ 9:30pm', team: 'Pitched Slapped', runs: 12, oppRuns: 14, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Mar 15 @ 8:30pm', team: 'Caught Looking', runs: 10, oppRuns: 5, location: 'home', park: 'Horizon', gametype: 'Postseason', level: 'C' }
        , {time: 'Wed, Mar 15 @ 9:30pm', team: 'Henkel', runs: 21, oppRuns: 20, location: 'home', park: 'Horizon', gametype: 'Postseason', level: 'C' }
     ]
    },
    fall16: { 
      season: 'Fall',
      year: 2016,
      wins: 8, 
      losses: 6,
       ties: 0,
       schedule: [{time: 'Wed, Sept 14 @ 6:30pm', team: 'Moisticles', runs: 14, oppRuns: 7, location: 'home', park: 'Horizon', gametype: 'League', level: 'C'}
        , {time: 'Wed, Sept 14 @ 7:30pm', team: 'Moisticles', runs: 14, oppRuns: 15, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Sept 21 @ 6:30pm', team: 'The Tuff Guys', runs: 8, oppRuns: 12, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Sept 21 @ 7:30pm', team: 'The Tuff Guys', runs: 18, oppRuns: 13, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Sept 28 @ 8:30pm', team: 'Fighting Chucks', runs: 15, oppRuns: 7, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Sept 28 @ 9:30pm', team: 'Fighting Chucks', runs: 11, oppRuns: 22, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 5 @ 6:30pm', team: 'Southern Wine & Spirits', runs: 0, oppRuns: 0, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 5 @ 7:30pm', team: 'Southern Wine & Spirits', runs: 0, oppRuns: 0, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 12 @ 8:30pm', team: 'Sons of Pitches', runs: 12, oppRuns: 13, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 12 @ 9:30pm', team: 'Sons of Pitches', runs: 11, oppRuns: 18, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 19 @ 6:30pm', team: 'Caught Looking', runs: 9, oppRuns: 18, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 19 @ 7:30pm', team: 'Caught Looking', runs: 20, oppRuns: 18, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 26 @ 8:30pm', team: 'Los Cacahuetes', runs: 21, oppRuns: 7, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Oct 26 @ 9:30pm', team: 'Los Cacahuetes', runs: 17, oppRuns: 7, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Nov 11 @ 8:30pm', team: 'Outlaws', runs: 10, oppRuns: 13, location: 'home', park: 'Horizon', gametype: 'Postseason', level: 'C' } 
       ]
      },
    summer16: { 
      season: 'Summer',
      year: 2016,
      wins: 9, 
      losses: 5, 
      ties: 0,
      schedule: [{time: 'Wed, June 8 @ 8:20pm', team: 'Southern Wine & Spirits', runs: 11, oppRuns: 9, location: 'home', park: 'Horizon', gametype: 'League', level: 'C'}
        , {time: 'Wed, June 8 @ 9:30pm', team: 'Southern Wine & Spirits', runs: 11, oppRuns: 12, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, June 15 @ 8:30pm', team: 'Fat Elgerts', runs: 17, oppRuns: 0, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, June 15 @ 9:30pm', team: 'Fat Elgerts', runs: 19, oppRuns: 3, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, June 22 @ 6:30pm', team: 'Caught Looking', runs: 12, oppRuns: 13, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, June 22 @ 7:30pm', team: 'Caught Looking', runs: 14, oppRuns: 8, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, June 29 @ 6:30pm', team: 'Sons of Pitches', runs: 21, oppRuns: 10, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, June 29 @ 7:30pm', team: 'Sons of Pitches', runs: 9, oppRuns: 8, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, July 6 @ 8:30pm', team: 'Bait & Pitch', runs: 14, oppRuns: 3, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, July 6 @ 9:30pm', team: 'Bait & Pitch', runs: 18, oppRuns: 5, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, July 13 @ 6:30pm', team: 'The Big Dogs', runs: 11, oppRuns: 17, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, July 13 @ 7:30pm', team: 'The Big Dogs', runs: 12, oppRuns: 13, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, July 20 @ 6:30pm', team: '99 Problems', runs: 3, oppRuns: 16, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, July 20 @ 7:30pm', team: '99 Problems', runs: 9, oppRuns: 1, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Aug 3 @ 6:30pm', team: 'Grayhawk Ghetto', runs: 11, oppRuns: 9, location: 'home', park: 'Horizon', gametype: 'Postseason', level: 'C' }
        , {time: 'Wed, Aug 3 @ 8:30pm', team: 'Southern Wine & Spirits', runs: 6, oppRuns: 9, location: 'home', park: 'Horizon', gametype: 'Postseason', level: 'C' }
      ]
     },
    spring16: { 
      season: 'Spring',
      year: 2016,
      wins: 4, 
      losses: 10, 
      ties: 0,
      schedule: [{time: 'Wed, Mar 23 @ 8:30pm', team: 'Tavern Americano', runs: 5, oppRuns: 17, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B'}
        , {time: 'Wed, Mar 23 @ 9:30pm', team: 'Thirsty Camels', runs: 2, oppRuns: 17, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Mar 23 @ 6:30pm', team: 'One More Pitcher', runs: 4, oppRuns: 10, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Mar 23 @ 7:30pm', team: 'Arena Sport Grill', runs: 15, oppRuns: 3, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 6 @ 8:30pm', team: 'One More Pitcher', runs: 7, oppRuns: 13, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 6 @ 9:30pm', team: 'Arena Sports Grill', runs: 1, oppRuns: 17, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 13 @ 6:30pm', team: 'Tavern Americano', runs: 3, oppRuns: 18, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 13 @ 7:30pm', team: 'Thirsty Camels', runs: 9, oppRuns: 15, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 20 @ 6:30pm', team: 'Manday', runs: 10, oppRuns: 11, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 20 @ 7:30pm', team: 'Hey Cuz', runs: 4, oppRuns: 21, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 27 @ 8:30pm', team: 'Manday', runs: 10, oppRuns: 22, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, Apr 27 @ 9:30pm', team: 'Hey Cuz', runs: 17, oppRuns: 13, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 4 @ 6:30pm', team: 'Irish Car Bombs', runs: 12, oppRuns: 2, location: 'home', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 4 @ 7:30pm', team: 'Irish Car Bombs', runs: 27, oppRuns: 11, location: 'away', park: 'Thompson Peak', gametype: 'League', level: 'B' }
        , {time: 'Wed, May 11 @ 6:30pm', team: 'Phoenix Ale Brewery', runs: 10, oppRuns: 4, location: 'home', park: 'Thompson Peak', gametype: 'Postseason', level: 'C' }
        , {time: 'Wed, May 11 @ 8:30pm', team: 'Cruisers', runs: 10, oppRuns: 11, location: 'away', park: 'Thompson Peak', gametype: 'Postseason', level: 'C' }
     ]
    },
    winter16: { 
      season: 'Winter',
      year: 2016,
      wins: 10, 
      losses: 3, 
      ties: 1,
      schedule: [{time: 'Wed, Jan 13 @ 6:30pm', team: 'Ba Da Bing', runs: 15, oppRuns: 15, location: 'home', park: 'Horizon', gametype: 'League', level: 'C'}
        , {time: 'Wed, Jan 13 @ 7:30pm', team: 'Irish Car Bombs', runs: 17, oppRuns: 10, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 20 @ 6:30pm', team: 'Ramrod', runs: 16, oppRuns: 3, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 20 @ 7:30pm', team: 'Phoenix Ale Brewery', runs: 8, oppRuns: 6, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 27 @ 8:30pm', team: 'Ba Da Bing', runs: 19, oppRuns: 7, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Jan 27 @ 9:30pm', team: 'Irish Car Bombs', runs: 15, oppRuns: 4, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 3 @ 8:30pm', team: 'Ramrod', runs: 1, oppRuns: 14, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 3 @ 8:30pm', team: 'Phoenix Ale Brewery', runs: 28, oppRuns: 6, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 10 @ 8:30pm', team: 'Outlaws', runs: 15, oppRuns: 14, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 10 @ 9:30pm', team: 'Cruisers', runs: 22, oppRuns: 5, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 17 @ 6:30pm', team: 'Basically Coed', runs: 18, oppRuns: 17, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 17 @ 7:30pm', team: 'Basically Coed', runs: 12, oppRuns: 5, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 24 @ 8:30pm', team: 'Outlaws', runs: 8, oppRuns: 9, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Feb 24 @ 8:30pm', team: 'Cruisers', runs: 13, oppRuns: 16, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Mar 2 @ 6:30pm', team: 'Thirsty Camels', runs: 9, oppRuns: 15, location: 'home', park: 'Thompson Peak', gametype: 'Postseason', level: 'B' }
      ] 
    },
    fall15: { 
      season: 'Fall',
      year: 2015,
      wins: 12, 
      losses: 2, 
      ties: 0,
      schedule: [{time: 'Mon, Sept 21 @ 8:30pm', team: 'Pitches Be Crazy', runs: 10, oppRuns: 4, location: 'home', park: 'Horizon', gametype: 'League', level: 'C'}
        , {time: 'Mon, Sept 21 @ 9:30pm', team: 'Pitches Be Crazy', runs: 30, oppRuns: 14, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Sept 28 @ 6:30pm', team: 'We\'ll Hit That', runs: 11, oppRuns: 12, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Sept 28 @ 7:30pm', team: 'We\'ll Hit That', runs: 18, oppRuns: 6, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Oct 5 @ 8:30pm', team: 'Zog Digital', runs: 12, oppRuns: 7, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Oct 5 @ 9:30pm', team: 'Zog Digital', runs: 20, oppRuns: 9, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Oct 12 @ 6:30pm', team: 'Tap House Kitchen', runs: 23, oppRuns: 7, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Oct 12 @ 7:30pm', team: 'Tap House Kitchen', runs: 21, oppRuns: 7, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Oct 19 @ 6:30pm', team: 'Team Antonio', runs: 11, oppRuns: 7, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Oct 19 @ 7:30pm', team: 'Team Antonio', runs: 17, oppRuns: 7, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Oct 26 @ 6:30pm', team: 'Sons of Pitches', runs: 0, oppRuns: 0, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Oct 26 @ 7:30pm', team: 'Sons of Pitches', runs: 0, oppRuns: 0, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Nov 2 @ 8:30pm', team: 'Bulleit', runs: 13, oppRuns: 22, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Nov 2 @ 9:30pm', team: 'Bulleit', runs: 13, oppRuns: 10, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Mon, Nov 9 @ 6:30pm', team: 'Kekambas', runs: 9, oppRuns: 14, location: 'away', park: 'Horizon', gametype: 'Postseason', level: 'D' }
]
    },
    summer15: { 
      season: 'Summer',
      year: 2015,
      wins: 10, 
      losses: 4, 
      ties: 0,
      schedule: [{time: 'Wed, June 10 @ 8:30pm', team: 'Scared Hitless', runs: 19, oppRuns: 9, location: 'home', park: 'Horizon', gametype: 'League', level: 'D'}
        , {time: 'Wed, June 10 @ 9:30pm', team: 'Scared Hitless', runs: 21, oppRuns: 2, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, June 17 @ 6:30pm', team: '99 Problems', runs: 17, oppRuns: 14, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, June 17 @ 7:30pm', team: '99 Problems', runs: 9, oppRuns: 11, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, June 24 @ 8:30pm', team: 'Fat Elgerts', runs: 13, oppRuns: 12, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, June 24 @ 9:30pm', team: 'Fat Elgerts', runs: 17, oppRuns: 5, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 1 @ 8:30pm', team: 'MMLL Stars', runs: 8, oppRuns: 24, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 1 @ 9:30pm', team: 'MMLL Stars', runs: 13, oppRuns: 17, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 8 @ 6:30pm', team: 'Immedia', runs: 23, oppRuns: 11, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 8 @ 7:30pm', team: 'Immedia', runs: 18, oppRuns: 14, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 15 @ 6:30pm', team: 'Ba Da Bing', runs: 16, oppRuns: 10, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 15 @ 7:30pm', team: 'Ba Da Bing', runs: 20, oppRuns: 13, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 22 @ 8:30pm', team: 'Discount Tire', runs: 13, oppRuns: 7, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 22 @ 9:30pm', team: 'Discount Tire', runs: 2, oppRuns: 13, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 29 @ 6:30pm', team: 'Outlaws', runs: 0, oppRuns: 11, location: 'away', park: 'Horizon', gametype: 'Postseason', level: 'C' }
     ]
    },
    spring15: {
      season: 'Spring',
      year: 2015, 
      wins: 3, 
      losses: 11, 
      ties: 0,
      schedule: [{time: 'Wed, Mar 25 @ 6:30pm', team: 'Layin Lumber', runs: 4, oppRuns: 15, location: 'home', park: 'Horizon', gametype: 'League', level: 'C'}
        , {time: 'Wed, Mar 25 @ 7:30pm', team: 'Layin Lumber', runs: 14, oppRuns: 5, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Apr 1 @ 6:30pm', team: 'Old Dogs', runs: 4, oppRuns: 5, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Apr 1 @ 7:30pm', team: 'Old Dogs', runs: 8, oppRuns: 15, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Apr 8 @ 6:30pm', team: 'Naturals', runs: 10, oppRuns: 17, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Apr 8 @ 7:30pm', team: 'Naturals', runs: 9, oppRuns: 15, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Apr 15 @ 8:30pm', team: 'Basically Coed', runs: 12, oppRuns: 14, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Apr 15 @ 9:30pm', team: 'Basically Coed', runs: 15, oppRuns: 17, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Apr 29 @ 8:30pm', team: 'Free Agents', runs: 18, oppRuns: 19, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, Apr 29 @ 9:30pm', team: 'Free Agents', runs: 9, oppRuns: 16, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, May 6 @ 6:30pm', team: 'Henkel', runs: 11, oppRuns: 13, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, May 6 @ 7:30pm', team: 'Henkel', runs: 11, oppRuns: 13, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, May 13 @ 8:30pm', team: 'Phoeinx Ale Brewery', runs: 12, oppRuns: 2, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, May 13 @ 9:30pm', team: 'Phoeinx Ale Brewery', runs: 10, oppRuns: 5, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
        , {time: 'Wed, May 20 @ 6:30pm', team: 'Ba Da Bing', runs: 14, oppRuns: 0, location: 'away', park: 'Horizon', gametype: 'Postseason', level: 'D' }
        , {time: 'Wed, May 20 @ 8:30pm', team: 'Arena Sports Grill - Sandsharks', runs: 12, oppRuns: 9, location: 'away', park: 'Horizon', gametype: 'Postseason', level: 'D' }
        , {time: 'Wed, May 20 @ 9:30pm', team: 'Henkel', runs: 8, oppRuns: 9, location: 'away', park: 'Horizon', gametype: 'Postseason', level: 'D' }
     ]
    },
    winter15: { 
      season: 'Winter',
      year: 2015,
      wins: 7, 
      losses: 7, 
      ties: 0,
      schedule: [{time: 'Wed, Jan 7 @ 8:30pm', team: 'AXP', runs: 9, oppRuns: 10, location: 'home', park: 'Horizon', gametype: 'League', level: 'C'}
      , {time: 'Wed, Jan 7 @ 9:30pm', team: 'AXP', runs: 19, oppRuns: 11, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Jan 14 @ 8:30pm', team: 'Who\'s on First', runs: 8, oppRuns: 7, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Jan 14 @ 9:30pm', team: 'Who\'s on First', runs: 4, oppRuns: 9, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Jan 21 @ 6:30pm', team: 'Phoenix Ale Brewery', runs: 12, oppRuns: 10, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Jan 21 @ 7:30pm', team: 'Phoenix Ale Brewery', runs: 8, oppRuns: 10, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Jan 28 @ 6:30pm', team: 'Waternuts All Year Round', runs: 16, oppRuns: 18, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Jan 28 @ 7:30pm', team: 'Waternuts All Year Round', runs: 7, oppRuns: 10, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Feb 4 @ 8:30pm', team: 'Outlaws', runs: 10, oppRuns: 22, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Feb 4 @ 9:30pm', team: 'Outlaws', runs: 16, oppRuns: 12, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Feb 11 @ 6:30pm', team: 'NOTW', runs: 21, oppRuns: 1, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Feb 11 @ 7:30pm', team: 'NOTW', runs: 14, oppRuns: 9, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Feb 18 @ 6:30pm', team: 'Old Dogs', runs: 13, oppRuns: 12, location: 'home', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Feb 18 @ 7:30pm', team: 'Old Dogs', runs: 15, oppRuns: 18, location: 'away', park: 'Horizon', gametype: 'League', level: 'C' }
      , {time: 'Wed, Feb 25 @ 7:30pm', team: 'Waternuts All Year Round', runs: 3, oppRuns: 13, location: 'home', park: 'Horizon', gametype: 'Postseason', level: 'C' }
      ] 
    },
    fall14: { 
      season: 'Fall',     wins: 8, 
      losses: 4, 
      ties: 2,
      schedule: [{time: 'Wed, Sept 17 @ 8:30pm', team: 'Old Dogs', runs: 10, oppRuns: 10, location: 'home', park: 'Horizon', gametype: 'League', level: 'D'}
        , {time: 'Wed, Sept 17 @ 9:30pm', team: 'Old Dogs', runs: 15, oppRuns: 8, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Sept 24 @ 8:30pm', team: 'Who\'s on First', runs: 5, oppRuns: 13, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Sept 24 @ 9:30pm', team: 'Who\'s on First', runs: 13, oppRuns: 12, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Oct 1 @ 8:30 pm', team: 'Arena Sports Grill Sandsharks', runs: 12, oppRuns: 15, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Oct 1 @ 9:30pm', team: 'Arena Sports Grill Sandsharks', runs: 13, oppRuns: 6, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Oct 8 @ 6:30pm', team: 'Ba Da Bing', runs: 16, oppRuns: 5, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Oct 8 @ 7:30pm', team: 'Ba Da Bing', runs: 14, oppRuns: 15, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Oct 22 @ 6:30pm', team: 'Dead Presidents', runs: 11, oppRuns: 7, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Oct 22 @ 7:30pm', team: 'Dead Presidents', runs: 8, oppRuns: 3, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Oct 29 @ 6:30pm', team: 'Los Cachuetes', runs: 16, oppRuns: 6, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Oct 29 @ 7:30pm', team: 'Los Cachuetes', runs: 9, oppRuns: 9, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Nov 5 @ 8:30pm', team: '99 Problems', runs: 17, oppRuns: 16, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Nov 5 @ 9:30pm', team: '99 Problems', runs: 4, oppRuns: 10, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, Nov 12 @ 8:30pm', team: 'AXP', runs: 12, oppRuns: 19, location: 'away', park: 'Horizon', gametype: 'Postseason', level: 'D' }
   ]
  },
   summer14: { 
      season: 'Summer',
      year: 2014,
      wins: 8,
      losses: 5,
      ties: 1,
      schedule: [{
           time: 'Wed, June 11, 2014 @ 6:30pm', team: '99 Problems', runs: 9, oppRuns: 8, location: 'home', park: 'Horizon', gametype: 'League', level: 'D'}
        , {time: 'Wed, June 11 2014 @ 7:30pm', team: '99 Problems', runs: 12, oppRuns: 13, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, June 18 2014 @ 8:30pm', team: 'MMLL Stars', runs: 15, oppRuns: 13, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, June 18 2014 @ 9:30pm', team: 'MMLL Stars', runs: 20, oppRuns: 8, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, June 25 2014 @ 8:30pm', team: 'Sons of Pitches', runs: 5, oppRuns: 5, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, June 25 2014 @ 9:30pm', team: 'Sons of Pitches', runs: 17, oppRuns: 12, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 2 2014 @ 6:30pm', team: 'Scared Hitless', runs: 12, oppRuns: 4, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 2 2014 @ 7:30pm', team: 'Scared Hitless', runs: 20, oppRuns: 3, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 9 2014 @ 8:30pm', team: 'NOTW', runs: 4, oppRuns: 25, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 9 2014 @ 9:30pm', team: 'NOTW', runs: 7, oppRuns: 15, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 16 2014 @ 8:30pm', team: 'Discount Tire', runs: 14, oppRuns: 12, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 16 2014 @ 9:30pm', team: 'Discount Tire', runs: 10, oppRuns: 9, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 23 2014 @ 6:30pm', team: 'Whiskey Tango Foxtrot', runs: 3, oppRuns: 4, location: 'away', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 23 2014 @ 7:30pm', team: 'Whiskey Tango Foxtrot', runs: 1, oppRuns: 16, location: 'home', park: 'Horizon', gametype: 'League', level: 'D' }
        , {time: 'Wed, July 30 2014 @ 7:30pm', team: 'Scared Hitless', runs: 11, oppRuns: 13, location: 'away', park: 'Horizon', gametype: 'Postseason', level: 'D' }
      ]
    }

    // coed: { wins: 14, losses: 1, ties: 1 },
  };

  response.json(results);
});

module.exports = router;
