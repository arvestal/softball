const express = require('express');
const router = express.Router();
const stats = require('./build-stats');
const csvFile = __dirname + "/coed.csv";


router.get('/coed', (request, response) => {
  stats.convertToJson(csvFile)
  .then((data) => {
      console.log(data);
      response.json(data);
      return data;
  });
});

module.exports = router;
