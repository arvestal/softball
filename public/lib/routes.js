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
    winter20: { wins: 6, losses: 2, ties: 0 },
    fall19: { wins: 12, losses: 2, ties: 0 },
    spring19: { wins: 10, losses: 3, ties: 1 },
    fall18: { wins: 5, losses: 5, ties: 0 },
    summer18: { wins: 8, losses: 3, ties: 1 },
    spring18: { wins: 8, losses: 6, ties: 0 },
    winter18: { wins: 9, losses: 1, ties: 0 },
    fall17: { wins: 11, losses: 3, ties: 0 },
    summer17: { wins: 8, losses: 6, ties: 0 },
    spring17: { wins: 7, losses: 8, ties: 1 },
    winter17: { wins: 9, losses: 5, ties: 0 },
    fall16: { wins: 8, losses: 6, ties: 0 },
    summer16: { wins: 9, losses: 5, ties: 0 },
    spring16: { wins: 4, losses: 10, ties: 0 },
    winter16: { wins: 10, losses: 3, ties: 1 },
    fall15: { wins: 12, losses: 2, ties: 0 },
    summer15: { wins: 10, losses: 4, ties: 0 },
    spring15: { wins: 3, losses: 11, ties: 0 },
    winter15: { wins: 7, losses: 7, ties: 0 },
    fall14: { wins: 8, losses: 4, ties: 2 },
    summer14: { wins: 8, losses: 5, ties: 1 },
    coed: { wins: 14, losses: 1, ties: 1 },
  };

  response.json(results);
});

module.exports = router;
