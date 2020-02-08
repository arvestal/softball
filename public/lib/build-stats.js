const Converter = require('csvtojson').Converter;
const fs = require('fs');
const headers = ['Number','Last', 'First', 'GP', 'PA', 'AB', 'Hits'
    , 'Singles', 'Doubles', 'Triples', 'HR', 'RBI', 'Runs'
    ,,,'FC',,'BB','K','AVG','OBP','SLG','OPS'
    ,,,,,,,,,,,'XBH','TB','AB_HR','BA_RISP',,,,,,,,,'SAC','SF','LOB','TwoOUTRBI',,'QAB','QABP'];

function rebuild(json) {
    let stats = [];
    json.forEach ((item) => {
        if (item.Number !== 'Team')
        {
      let {Number, Last, First, GP, PA, AB, Hits, Singles, Doubles, Triples, HR, RBI, Runs, FC, BB, K, AVG, OBP, SLG, OPS
          , XBH, TB, AB_HR, BA_RISP, SAC, SF, LOB, TwoOUTRBI, QAB, QABP } = item;
      
        //  int totalBases = singles + (doubles * 2) + (triples * 3) + (hr * 4);
        //   float avg = (float)hits / (float)atBats;
        //   float obp = (float)(hits + walks) / (float)(atBats + walks + sac);
        //   float slg = (float)totalBases / (float)atBats;
        //   float ops = (float)obp + (float)slg;
        const firstName = First === '' ? '' : `${First.substring(0, 1)}. `;
        const playerName =  `${firstName}${Last}`;
        let qab = parseInt(QAB, 10) / + parseInt(PA);
        let sacfly = parseInt(SF, 10) + parseInt(SAC, 10);
  
      const newFormatedJson = {
          id: +Number,
          Lastname: playerName,
          GP: +GP,
          PA: +PA,
          AB: +AB,
          H: +Hits,
          S: +Singles,
          D: +Doubles,
          T: +Triples,
          HR: +HR,
          RBI: +RBI,
          R: +Runs,
          FC: +FC,
          BB: +BB,
          K: +K,
          AVG: AVG,
          OBP: OBP,
          SLG: SLG,
          OPS: OPS,
          SAC: +sacfly,
          TB: +TB,
          QABP: qab
      };

      stats.push(newFormatedJson);
    }
    });
    return stats;
}

module.exports.convertToJson = convertToJson = (file) => {
    const converter = new Converter({noheader:false, headers: headers, delimiter: ","});

    return new Promise((resolve, reject) => {
        converter.on('end_parsed', (jsonData) => {
            const data = rebuild(jsonData);
            resolve(data);
        });
        fs.createReadStream(file).pipe(converter);
    });
}
