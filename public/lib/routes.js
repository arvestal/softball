const express = require('express');
const router = express.Router();
const stats = require('./build-stats');


router.get('/coed', (request, response) => {
  const csvFile = __dirname + "/coed.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      console.log(data);
      response.json(data);
      return data;
  });
});

router.get('/fall17', (request, response) => {
  const csvFile = __dirname + "/17fall.csv";
  stats.convertToJson(csvFile)
  .then((data) => {
      console.log(data);
      response.json(data);
      return data;
  });
});

module.exports = router;
