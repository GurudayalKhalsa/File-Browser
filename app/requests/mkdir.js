var config = require('../config');
var fs = require('fs');
var ncp = require('ncp');
var rm = require('rimraf');

exports.type = 'post';

exports.fn = function(req, res){
  var options = req.body.options;
  var path = req.body.path;
  if(path[0] === '~') path = config.HOME + path.substr(1);
  var paths = path.split('/');
  var currentDir = paths.slice(0, paths.length-1).join('/');
  if(fs.existsSync(currentDir)){
    fs.mkdir(path, function(err){
      if(!err){
        if(options.copy === "true" || options.move === "true"){
          //copy
          req.body.files.forEach(function(file){
            var src = file;
            var dest = path + '/' + src.split('/').pop();
                        
            ncp(src, dest, function (err) {

              if (err) {
                res.send({success: false, err: err});
              } else {
                //if specified to move and not copy, delete src
                if(options.move === "true"){
                  rm(src, function(err){
                    if(!err){
                      res.send({success: true});
                    } else {
                      res.send({success: false, err: err});
                    }
                  });
                } else {
                  res.send({success: true});
                }
              }
             
            });  
          });            
        } else {
          res.send({success: true});
        }
      } else {
        res.send({success: false, error: err})
      }
    });
  }
}