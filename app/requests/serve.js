var config = require('../config');
var fs = require('fs');

//static asset server for all files/folders in /
exports.type = 'get';

exports.fn = function(req, res){

  var path = req.params[0];
  if(path[0] === '~') path = config.HOME + path.substr(1);
  if(!fs.existsSync(path)) res.send(500, {error:'File or folder ' + path + ' does not exist'});
  
  var stat = fs.lstatSync(path);
  console.log(path, stat.isDirectory())
  if(stat.isDirectory()) {
    //send html page
    var tmp = path + "/" + "index.html";
    if(fs.existsSync(tmp)) path = tmp;
    //send directory listing
    else res.send(
      '<ul>' +
        fs.readdirSync(path).filter(function(val){
          return val[0] === '.' ? (req.param('showHidden') === undefined ? false : true) : true;
        }).map(function(val){
          return '<li><a href="'+val+'">'+val+'</a></li>'
        }).join('') +
      '</ul>'
    );
  }
  //send raw file
  res.sendfile(path);
}