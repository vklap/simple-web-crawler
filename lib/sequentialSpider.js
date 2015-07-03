/**
 * Created by victor on 03/07/15.
 */

var utilities = require('./infra/utilities');
var download = require('./infra/phantomWrapper').download;

module.exports.spider = spiderLinks;

var crawledIdentifiers = {};
var identifiersToData = {};

function spiderLinks(currentUrl, content, nesting, callback) {
  if (nesting == 0) {
    return process.nextTick(callback);
  }

  var links = utilities.getPageLinks(currentUrl, body);
  function iterate(index) {
    if (index == links.length) {
      return callback(null, identifiersToData);
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

function spider(url, nesting, callback) {
  var urlIdentifier = utilities.urlToIdentifier(url);

  if (crawledIdentifiers[urlIdentifier]) {
    return spiderLinks(url, identifiersToData[urlIdentifier]['content'], nesting, callback);
  }

  return download(url, function(err, content){
    if (err) {
      return callback(err);
    }
    urlIdentifier[urlIdentifier] = true;
    identifiersToData[urlIdentifier]['content'] = content;
    identifiersToData[urlIdentifier]['url'] = url;
    spiderLinks(url, content, nesting, callback);
  });
}

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


