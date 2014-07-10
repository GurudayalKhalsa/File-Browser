var metadata = require('../lib/metadata/');
var config = require('../config');

exports.type = 'post';
exports.fn = function(req, res){
  var path = req.body.path;
  if(path[0] === '~') path = config.HOME + path.substr(1);
  path = path;
  
  metadata(path, function(err, metadata){
    res.send({success: true, data: metadata});
  });
}