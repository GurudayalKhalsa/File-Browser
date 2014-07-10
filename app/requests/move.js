var config = require('../config');
var fs = require('fs');
var ncp = require('ncp');
var rm = require('rimraf');

exports.type = 'post';
exports.fn = function(req, res){
  
  var from = req.body.from;
  var to = req.body.to;
  if(from[0] === '~') from = config.HOME + from.substr(1);
  if(to[0] === '~') to = config.HOME + to.substr(1);

  var options = req.body.options;
  
  var successes = 0, 
      len = Array.isArray(req.body.from) ? 1 : req.body.from.length;
  
  if(Array.isArray(from)) from.forEach(function(f){
    move(f, to, options);
  });
  else move(f, to, options);
  
  function move(from, to, options){
        
    from = from;
    to = to;
    
    var fromPaths = from.split('/');
    var toPaths = to.split('/');

    var fromName = fromPaths.pop();
    var toName = toPaths.pop();
    
    if(!fs.existsSync(from)){
      console.log(from, "doesn't exist")
      return res.send({error: "Path " + from + " does not exist"});
    }
    
    if(fromName !== toName){
      to += to[to.length-1] === '/' ? fromName : '/' + fromName;
    }
    
    var toDir = to.split('/').slice(0, to.split('/').length-1).join('/');
    
    if(!fs.existsSync(toDir) || !fs.lstatSync(toDir).isDirectory()){
      console.log(toDir, "is not a valid directory")
      return res.send({error: "Path " + toDir + " is not a valid directory"});
    }
    
    //copy
    ncp(from, to, function (err) {

      if (err) {
        res.send({success: false, err: err});
      } else {
        //if specified to move and not copy, delete from
        if(options.copy === "false"){
          rm(from, function(err){
            if(!err){
              res.send({success: true});
            } else {
              res.send({success: false, err: err});
            }
          });
        }
        success();
      }
     
    });    
  }
  
  function success(){
    successes++;
    if(successes === len){
      res.send({'success': true});
    }
  }
  
}