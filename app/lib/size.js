var fs = require('fs');
var path = require('path');

module.exports = function(dir, cb) {
  var again, async_running, file_counter, total;
  total = 0;
  file_counter = 1;
  async_running = 0;
  again = function(current_dir) {
    return fs.lstat(current_dir, function(err, stat) {
      if (err) {
        file_counter--;
        return;
      }
      if (stat.isFile()) {
        file_counter--;
        total += stat.size;
      } else if (stat.isDirectory()) {
        file_counter--;
        async_running++;
        fs.readdir(current_dir, function(err, files) {
          var file, _i, _len, _results;
          async_running--;
          if (err) {
            return;
          }
          file_counter += files.length;
          _results = [];
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            file = files[_i];
            _results.push(again(path.join(current_dir, file)));
          }
          return _results;
        });
      } else {
        file_counter--;
      }
      if (file_counter === 0 && async_running === 0) {
        return cb(null, total);
      }
    });
  };
  return again(dir);
};
