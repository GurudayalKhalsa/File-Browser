var config = require('../config');
var fs = require('fs');
var async = require('async');
var mime = require('mime');

exports.type = 'get';
exports.fn = function(req, res){
  var path = req.params[0] || '';
  if(path[0] === '~') path = config.HOME + path.substr(1);
  
  //exit if not valid path
  if(!fs.existsSync(path) && !fs.existsSync((path = path + "/")) && !fs.existsSync((path = path.slice(0, path.length-2)))) return res.send({error: "File or folder " + path + " does not exist."});
  
  var stats = fs.lstatSync(path);
  
  //if file, return raw file
  if(stats.isFile()){
    return res.sendfile(path);
  }
  
  //if folder, return folder
  if(path[path.length-1] !== "/") path += "/";
  var files = fs.readdirSync(path);
  var data = {files:[]};
  async.map(files, function(name, cb){
    var p = path + name;
    var stat = fs.lstatSync(p);
    var size = stat.size;
    p = path + name;
    
    var file = {
      data: {
        name: name,
        path: p,
        type: stat.isDirectory() ? 'folder' : 'file',
        'mime type': mime.lookup(p),
        size: stat.size,
        'last access time': stat.atime.getTime(),
        'last modified time': stat.mtime.getTime(),
        'last change time': stat.ctime.getTime()
      }
    };
    
    cb(null, file);
    
  }, function(err, files){
    data.files = files;
    res.send(data);
  });
}