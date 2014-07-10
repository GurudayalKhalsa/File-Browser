var config = require('../config');
var fs = require('fs');

exports.type = 'post';
exports.fn = function(req, res){
  var path = req.body.path;
  if(path[0] === '~') path = config.HOME + path.substr(1);
  var paths = path.split('/');
  var currentDir = paths.slice(0, paths.length-1).join('/');
  if(fs.existsSync(currentDir)){
    fs.open(path, 'w', function(err){
      if(!err){
        res.send({success: true});
      } else {
        res.send({success: false, error: err})
      }
    });
  }
}