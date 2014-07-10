var config = require('../config');
var fs = require('fs');

exports.type = 'post';

exports.fn = function(req, res){
  var paths = req.body.files.map(function(path){ 
    if(path[0] === '~') path = config.HOME + path.substr(1);
    return path;   
  });
  var ok = true;
  
  paths.forEach(function(path){
    
    var stats = fs.lstatSync(path);
    if(stats.isDirectory()){
      var res = rm.sync(path);
    } else {
      var res = fs.unlinkSync(path);
    }
  });
  
    if(ok) res.send({'success': true});
}