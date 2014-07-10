var fs = require('fs');
var config = require('../config');

exports.type = 'post';

exports.fn = function(req, res){
  var from = req.body.from;
  var to = req.body.to;
  if(from[0] === '~') from = config.HOME + from.substr(1);
  if(to[0] === '~') to = config.HOME + to.substr(1);

  fs.rename(from, to, function(err){
    if(!err){
      res.send({success: true});
    } else {
      res.send({success: false, error: err})
    }
  });
}