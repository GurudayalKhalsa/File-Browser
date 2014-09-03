var util = require('./lib/util');
var App = require('./app');

var config = {
  ViewSelector: '#view',
  initialPath: '~/',
  showHiddenFiles: false,
  sortOrder: 'ascending',
  sortBy: 'name',
  READ_URL: '/read',
  SERVE_URL: '/serve/',
  MOVE_URL: '/move',
  DELETE_URL: '/delete',
  RENAME_URL: '/rename',
  NEWFOLDER_URL: '/mkdir',
  NEWFILE_URL: '/touch',
  INFO_URL: '/info',
  keymaps: {
    selectAll: 'meta+a',
    deselectAll: 'meta+d',
    info: 'i'
  },
  file: {
    fileTypes: {
      image: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tif", "tiff", "dng", "cr2", "raw", "nef", "icns", 'psd'],
      audio: ["mp3", "ogg", "wav", "wma", "flac", "aiff"],
      video: ["mov", "mp4", "m4v", "avi", "flv", "mkv", "mts", "wmv"],
      text: ["txt", "rtf"],
      code: ["html", "yml", "yaml", "haml", "js", "coffee", "css", "scss", "less", "stylus", "md", "json", "py", "c", "cpp", "rb", "php", "cs", "java", "h", "m", "hh", "mm"],
      pdf: ['pdf', 'eps', 'svg', 'ai'],
      word: ["doc", "docx", 'dot', 'dotx', 'pages'],
      excel: ["xls", "xlsx", "csv", 'numbers'],
      powerpoint: ["ppt", "pptx", 'pps', 'keynote'],
      archive: ["zip", "gzip", "tar", "tar.gz", "tgz", "rar", "iso", "gz", "dmg"]
    },

    iconTypes: {
      folder: 'folder-o',
      file: 'file-o',
      image: 'file-image-o',
      audio: 'file-audio-o',
      video: 'file-video-o',
      text: 'file-text-o',
      code: 'file-code-o',
      pdf: 'file-pdf-o',
      word: 'file-word-o',
      excel: 'file-excel-o',
      powerpoint: 'file-powerpoint-o',
      archive: 'file-archive-o'
    },
    
    displayedInfo: {
      multiple: ['path', 'filecount', 'size'],
      single: {
        default: ['name', 'path', 'size', 'last access time', 'last change time', 'last modified time'],
        file: ['file type', 'file type', 'mime type', 'file permissions', 'download entry url'],
        folder: ['type'],
        image: ['title', 'image size', 'make', 'camera model name', 'shutter speed', 'f number', 'iso', 'flash', 'exposure program', 'white balance', 'create date', 'date time original', 'lens', 'lens id', 'focal length', 'field of view', 'scale factor to 35 mm equivalent', 'profile description', 'icc profile name', 'quality', 'bits per sample', 'bit depth', 'filter', 'interlaced', 'transparency', 'encoding process', 'author', 'creator', 'copyright', 'software', 'creator tool'],
        audio: ['title', 'artist', 'album', 'composer', 'year', 'genre', 'track', 'duration', 'audio bitrate', 'sample rate', 'date time original', 'creator tool', 'encoder',],
        video: ['title', 'image size', 'duration', 'avg bitrate', 'video frame rate', 'audio channels', 'audio codec id', 'date time original', 'author', 'compressor id', 'compressor name', 'major brand', 'video codec id'],
        text: [''],
        code: ['title', 'viewport'],
        pdf: ['title', 'author', 'pagecount', 'page count', 'pdf version', 'creator', 'creator tool', 'creator version', 'producer'],
        excel: ['title', 'subject', 'author', 'company', 'create date', 'modify date', 'comments', 'keywords', 'revision number', 'modify date', 'total edit time', 'software', 'application', 'app version'],
        powerpoint: ['title', 'subject', 'author', 'creator', 'company', 'create date', 'modify date', 'slides', 'notes', 'paragraphs', 'words', 'revision number', 'total edit time', 'presentation format', 'comments', 'keywords', 'software', 'application', 'app version'],
        word: ['title', 'subject', 'author', 'creator', 'company', 'create date', 'modify date', 'pages', 'paragraphs', 'lines', 'words', 'characters', 'revision number', 'total edit time', 'comments', 'keywords', 'software', 'application', 'app version'],
        archive: ['zip file name', 'zip modify date']
      }
    }
  }
};

module.exports = config;