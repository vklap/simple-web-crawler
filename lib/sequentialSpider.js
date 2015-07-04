/**
 * Created by victor on 03/07/15.
 */

var utilities = require('./infra/utilities');
var download = require('./infra/phantomWrapper').download;
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports.spider = spiderLinks;

function spiderLinks(currentUrl, content, nesting, callback) {
  if (nesting == 0) {
    return process.nextTick(callback);
  }

  var links = utilities.getPageLinks(currentUrl, content);
  function iterate(index) {
    if (index == links.length) {
      return callback();
    }

    spider(links[index], nesting - 1, function(err) {
      if (err){
        return callback(err);
      }
      iterate(index + 1);
    });
  }

  iterate(0);
}

function saveFile(filename, content, callback) {
  mkdirp(path.dirname(filename), function(err) {
    if (err) {
      return callback(err);
    }
    fs.writeFile(filename, content, callback);
  });
}

function spider(url, nesting, callback) {
  var filename = path.join('/tmp/crawler', utilities.urlToFilename(url));

  fs.readFile(filename, 'utf8', function(err, content){
    if (err) {
      if (err.code == 'ENOENT') {
        return download(url, function(err, content){
          console.log('Downloaded url ' + url);
          if (err) {
            return callback(err);
          }

          saveFile(filename, content, function(err){
            if (err) {
              return callback(err);
            }
            console.log('Downloaded and saved url ' + url);
            spiderLinks(url, content, nesting, callback);
          });
        });
      }
      return callback(err);
    }

    spiderLinks(url, content, nesting, callback);
  });
}

var start = Date.now();
spider(process.argv[2], 10, function(err) {
  console.log('Finished downloading');
  var stop = Date.now();
  var seconds = (stop - start) / 1000.00;
  console.log('Total seconds: ' + seconds);
  if (err) {
    console.log(err);
    process.exit(1);
  } else {
    console.log('Download complete');
  }
});

/*
function iterate(tasks, index) {
  if (index == tasks.length) {
    return finish();
  }

  var task = tasks[index];
  task(function() {
    iterate(tasks, index + 1)
  });
}

function finish() {

}
*/

