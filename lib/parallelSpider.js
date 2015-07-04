/**
 * Created by victor on 03/07/15.
 */

var utilities = require('./infra/utilities');
var download = require('./infra/phantomWrapper').download;
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var TaskQueue = require('./infra/taskQueue');

module.exports.spider = spiderLinks;

var spidering = {};
var downloadQueue = new TaskQueue(2);

function spiderLinks(currentUrl, content, nesting, callback) {
  if (nesting == 0) {
    return process.nextTick(callback);
  }

  var links = utilities.getPageLinks(currentUrl, content);
  if (links.length == 0) {
    return process.nextTick(callback);
  }

  var completed = 0, hasErrors = false;

  console.log(links.length);
  links.forEach(function(link){
    console.log("link iterator: " + link);
    downloadQueue.pushTask(function(done){
      spider(link, nesting-1, function(err) {
        if (err) {
          hasErrors = true;
          return callback(err);
        }
        if (++completed == links.length && !hasErrors) {
          callback();
        }
        done();
      });
    });
  });
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
  console.log("spider url: " + url);
  if (spidering[url]) {
    return process.nextTick(callback);
  }
  spidering[url] = true;

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
spider(process.argv[2], 5, function(err) {
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
 var completed=0;
 function iterate(tasks) {
  tasks.forEach(function(task) {
    task(function() {
      if (++completed == tasks.length) {
        finish();
      }
    });
  });
 }

 function finish() {
 }
 */

