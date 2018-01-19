const fs = require('fs');
const sutil = require('line-stream-util');
const chai = require('chai');
const assert = chai.assert;

// const data = fs.readFile('/Users/avestal/Documents/pluralsight/docker/softball/public/lib/coed.csv', (err, data) => {
//   if (err) {
//     return console.log(err);
//   }

//   console.log(data.);
// });



describe('headers should match', () => {
  let item;
  beforeEach(() => {

    fs.createReadStream('/Users/avestal/Documents/pluralsight/docker/softball/public/lib/coed.csv')
    .pipe(sutil.head(1)) // get head lines
    .pipe(sutil.split())
    .setEncoding('utf8')
    .on('data', (data) => {
    
      console.log(data);
    
      item = data.split(',');

    });

  });


  it('headers used should match', done => {
    assert.equal(item[1], 'Last')    
    done();
  });
});
