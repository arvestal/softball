const express = require('express');
const router = express.Router();

const { SEASON_ORDER, SEASONS, POSTSEASON_RECORD, CAREER_PLAYER_IDS, POSTSEASON_PLAYER_IDS } = require('../../data/softball/standings');
const seasonStats = require('../../data/softball/seasons');
const { STAT_COLUMNS, sortByAvgDesc, filterByIds } = require('../lib/stats');
const { decorateSchedule, championshipLevel, championshipSeasons } = require('../lib/schedule');
const { seasonsForLabel } = require('../lib/nav');

router.get('/', (req, res) => {
  const totals = SEASON_ORDER.reduce((acc, key) => {
    const s = SEASONS[key];
    acc.wins += s.wins;
    acc.losses += s.losses;
    acc.ties += s.ties;
    return acc;
  }, { wins: 0, losses: 0, ties: 0 });
  totals.wins += POSTSEASON_RECORD.wins;
  totals.losses += POSTSEASON_RECORD.losses;

  const fullGameLog = decorateSchedule(SEASON_ORDER.flatMap((key) => SEASONS[key].schedule));

  res.render('softball/career', {
    pageTitle: 'Career Stats',
    columns: STAT_COLUMNS,
    careerPlayers: sortByAvgDesc(filterByIds(seasonStats.career, CAREER_PLAYER_IDS)),
    totals,
    games: fullGameLog,
    championships: championshipSeasons(SEASON_ORDER.map((key) => SEASONS[key])),
  });
});

router.get('/postseason', (req, res) => {
  const postseasonGames = decorateSchedule(
    SEASON_ORDER.flatMap((key) => SEASONS[key].schedule).filter((g) => g.gametype === 'Postseason')
  );

  res.render('softball/season', {
    pageTitle: 'Postseason Stats',
    label: 'PostSeason',
    year: '',
    record: POSTSEASON_RECORD,
    columns: STAT_COLUMNS,
    players: sortByAvgDesc(filterByIds(seasonStats.postseason, POSTSEASON_PLAYER_IDS)),
    games: postseasonGames,
    championshipLevel: null,
  });
});

router.get('/:season', (req, res) => {
  const key = req.params.season;
  const season = SEASONS[key];
  const players = seasonStats.bySeasonKey[key];

  if (!season || !players) {
    return res.status(404).render('error', {
      pageTitle: 'Season Not Found',
      message: `No softball season found for "${key}".`,
      noIndex: true,
    });
  }

  const yearTabs = seasonsForLabel(season.label).map((s) => ({ ...s, active: s.key === key }));

  res.render('softball/season', {
    pageTitle: `${season.label} ${season.year}`,
    label: season.label,
    year: season.year,
    record: season,
    columns: STAT_COLUMNS,
    players: sortByAvgDesc(players),
    games: decorateSchedule(season.schedule),
    championshipLevel: championshipLevel(season.schedule),
    yearTabs,
  });
});

module.exports = router;
