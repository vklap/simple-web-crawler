/**
 * Created by victor on 03/07/15.
 */

var phantom = require('phantom');

module.exports.download = function download(url, callback) {
  phantom.create(
    {
      parameters: {
        'ssl-protocol': 'any'
        //'ssl-protocol': 'tlsv1',
        //'ignore-ssl-errors': 'yes'
      }
    },
    function(ph){
      ph.createPage(function(page){
      page.set('onResourceError', function(resourceError) {
        page.reason = resourceError.errorString;
        page.reason_url = resourceError.url;
      });
      page.open(url, function(status) {
        if (status !== 'success') {
          var errorMessage = "Failed to download page '" + url + "' due to '" + page.reason + "'";
          console.error(errorMessage);
          ph.exit();
          return callback(new Error(errorMessage));
        }
        page.evaluate(function() {
          return document.documentElement.outerHTML;
        }, function(content) {
          ph.exit();
          callback(null, content);
        });
      });
    });
  });
};
