const express = require("express");
const router = express.Router();
const stats = require("./build-stats");


router.get("/stats", (request, response) => {
  let season = request.query['season'];
  const csvFile = `${__dirname}/gc_files/${season}.csv`;
  stats.convertToJson(csvFile).then(data => {
    response.json(data);
  });
});

router.get("/standings", (request, response) => {
  const results = {
    coed: { wins: 14, losses: 1, ties: 1 },
    postseason: { wins: 16, losses: 15 },
    /*winter19: { wins: 0, losses: 0, ties: 0 },*/
    fall19: { wins: 11, losses: 1, ties: 0 },
    spring19: { wins: 10, losses: 3, ties: 1 },
    fall18: { wins: 5, losses: 5, ties: 0 },
    summer18: { wins: 8, losses: 3, ties: 1 },
    spring18: { wins: 8, losses: 6, ties: 0 },
    winter18: { wins: 9, losses: 1, ties: 0 },
    fall17: { wins: 10, losses: 4, ties: 0 },
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
    fall14: { wins: 7, losses: 5, ties: 2 },
    summer14: { wins: 8, losses: 5, ties: 1 }
  };

  response.json(results);
});

module.exports = router;
