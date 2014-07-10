var Vue = require('vue');

module.exports = function(key, val){
  
  //folder of files
  if(key === 'filecount'){ val += ' files' }
  
    
  //file
  if(key === 'size' || key === 'filesize'){
    var bytes = val;
    if(bytes < 1024) val = bytes + " B";
    else if(bytes < 1024*1024) val = (bytes/1024).toFixed(1) + ' KB';
    else if(bytes < 1024*1024*1024) val = (bytes/1024/1024).toFixed(1) + ' MB';
    else if(bytes < 1024*1024*1024*1024) val = (bytes/1024/1024/1024).toFixed(1) + ' GB';
  }
  else if((key.match('date') || key.match('time')) && val && !(key.match('total edit time'))){
    var orig = val;
    function parseExifDate(str){
      if(typeof str !== 'string' || !str.match(':')) return str;
      var date = str.split(' ')[0];
      var time = str.split(' ')[1];
      date = date.replace(/\:/g,'/');
      time = time.replace(/(\.\d*|[a-zA-Z])/g, '');
      return Date.parse(date + ' ' + time);
    }
    val = parseExifDate(val);
    val = new Date(val);
    val = val.toString();
  }
    
  //image
  else if(key === 'lens id' && val && val.match('Unknown')){
    val = undefined;
  }
  
  else if(key === 'focal length' && val && val.indexOf('0.0 mm') === 0){
    val = undefined;
  }
  else if(key === 'shutter speed'){
    key = 'shutter speed';
    if(val) val += 's';
  }
  else if(key === 'f number'){
    if(val === '0') val = undefined;
    else {
      var tmp = val;
      key = 'aperture';
      if(val) val = 'f/'+val;
    }
  }
  else if(key === 'iso'){ key = 'ISO' }
  
  //audio
  else if(key === 'track'){ key = 'track number' }
  
  //video
  
  //text
  
  //code
  
  //pdf
  else if(key.match('pdf')){ key = key.replace('pdf', 'PDF') }
  
  //excel
  
  //powerpoint
  
  //word
  
  //archive
  
  
  
  return {key: key, val: val};
  
};