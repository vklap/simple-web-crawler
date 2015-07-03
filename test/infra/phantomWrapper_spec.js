/**
 * Created by victor on 04/07/15.
 */

var expect = require('expect');
var phantomWrapper = require('../../lib/infra/phantomWrapper');

describe('phantomWrapper', function() {
  it('should download content', function(done) {
    this.timeout(5000);
    phantomWrapper.download('https://www.google.com/', function(err, content) {
      if (err) {
        return done(err);
      }
      console.log(content);
      expect(content).toMatch(/html/);
      done();
    });
  });
});