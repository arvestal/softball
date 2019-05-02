const express = require('express');
const router = express.Router();
const stats = require('./build-stats');


router.get('/coed', (request, response) => {
  const csvFile = __dirname + "/coed.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      //console.log(data);
      response.json(data);
  });
});

router.get('/postseason', (request, response) => {
  const csvFile = __dirname + "/postseason.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      //console.log(data);
      response.json(data);
  });
});

router.get('/fall17', (request, response) => {
  const csvFile = __dirname + "/17fall.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      //console.log(data);
      response.json(data);
  });
});

router.get('/winter18', (request, response) => {
  const csvFile = __dirname + "/18winter.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      // console.log(data);
      response.json(data);
  });
});

router.get('/spring18', (request, response) => {
  const csvFile = __dirname + "/18spring.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      console.log(data);
      response.json(data);
  });
});

router.get('/summer18', (request, response) => {
  const csvFile = __dirname + "/18summer.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      console.log(data);
      response.json(data);
  });
});

router.get('/fall18', (request, response) => {
  const csvFile = __dirname + "/18fall.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      console.log(data);
      response.json(data);
  });
});

router.get('/spring19', (request, response) => {
  const csvFile = __dirname + "/19spring.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      //console.log(data);
      response.json(data);
  });
});

router.get('/standings', (request, response) => {
  const results = {
    coed: {wins: 14, losses: 1, ties: 1},
    postseason: {wins: 15, losses: 14},
    spring19: {wins: 10, losses: 3, ties: 1},
    fall18: {wins: 5, losses: 5, ties:0},
    summer18: {wins: 8, losses: 3, ties: 1},
    spring18: {wins: 8, losses: 6, ties: 0},
    winter18: {wins: 9, losses: 1, ties: 0},
    fall17: {wins: 10, losses: 4, ties: 0},
    summer17: {wins: 8, losses: 6, ties: 0},
    spring17: {wins: 7, losses: 8, ties: 1},
    winter17: {wins: 9, losses: 5, ties: 0},
    fall16: {wins: 8, losses: 6, ties: 0},
    summer16: {wins: 9, losses: 5, ties: 0},
    spring16: {wins: 4, losses: 10, ties: 0},
    winter16: {wins: 10, losses: 3, ties: 1},
    fall15: {wins: 12, losses: 2, ties: 0},
    summer15: {wins: 10, losses: 4, ties: 0},
    spring15: {wins: 3, losses: 11, ties: 0},
    winter15: {wins: 7, losses: 7, ties: 0},
    fall14: {wins: 7, losses: 5, ties: 2},
    summer14: {wins: 8, losses: 5, ties: 1}
  };

  response.json(results);
});

module.exports = router;
