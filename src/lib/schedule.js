function resultFor(game) {
  if (game.runs === 0 && game.oppRuns === 0) return 'FFT';
  if (game.runs > game.oppRuns) return 'W';
  if (game.runs === game.oppRuns) return 'T';
  return 'L';
}

// Adds display-ready fields to each game so templates only interpolate,
// they don't branch.
function decorateSchedule(games) {
  return games.map((game) => ({
    ...game,
    result: resultFor(game),
    opponentLabel: `${game.location === 'home' ? 'vs' : '@'} ${game.team}`,
    playoffNote: game.gametype === 'Postseason' ? `- ${game.level} League Playoffs` : '',
  }));
}

// Returns the league level ("B", "C", ...) if the season ended on a
// postseason win, otherwise null.
function championshipLevel(schedule) {
  const last = schedule[schedule.length - 1];
  const won = !!last && last.gametype === 'Postseason' && last.runs > last.oppRuns;
  return won ? last.level : null;
}

module.exports = { resultFor, decorateSchedule, championshipLevel };
