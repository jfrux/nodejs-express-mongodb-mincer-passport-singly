// Photo schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , imagr = require("easyimage")
  , uuid = require("node-uuid")
  , request = require("request")
  , fs = require("fs")
  , path = require("path")
  , uploadsDir = 'public/photo/_orig'
  , photosDir = 'public/photo'
  , photoUrl = '/photo/'
  , sizes = {
    'i':{'width':30,'height':30},
    't':{'width':100,'height':100},
    'p':{'width':210,'height':210},
    'f':{'width':800,'height':600}
  }

var PhotoSchema = new Schema({
    name: {type : String, default : '', trim : true}
  , description: {type : String, default : '', trim : true}
  , original: {type : String, default : '', trim : true}
  , extension: {type: String, default : '', trim : true }
  , paths: {type: Object}
  , comments: [{type : Schema.ObjectId, ref : 'Comment'}]
  , processed: { type: Boolean, default: false }
  , uploadedBy: {type : Schema.ObjectId, ref : 'User'}
  , createdAt  : {type : Date, default : Date.now}
})

PhotoSchema.method('process',function(callback) {
  var cb = callback;
  var writePath = path.resolve(__dirname,'../../',photosDir) + '/';

  
  var sizeKeys = Object.keys(sizes);
  var tasks = sizeKeys.length;
  var self = this;
  for(key in sizeKeys) {
    fileSize = sizes[sizeKeys[key]];
    fileName = path.resolve(__dirname,'../../',photosDir) + "/" + this._id + '_' + sizeKeys[key] + self.extension;
    imagr.resize({
      src:path.resolve(__dirname,'../../',this.original), 
      dst:fileName,
      width:fileSize['width'], 
      height:fileSize['height']
    }, function(err, stdout, stderr) {
      console.log(JSON.stringify(arguments));
      if(err || stderr) return cb(err);
      tasks--;
      if(tasks == 0) {
        //done
        self.processed = true;
        console.log("Done saving photos.");
        cb(null);
      }
    }); 
  }
});

PhotoSchema.method('download', function(uri,callback) {
	var self = this;
  var cb = callback;
  //var ext = path.extname(uri);
  self.name = path.basename(uri);
  console.log('photo URL: ' + uri);
  request({
    'uri':uri,
    'method':'get',
    'encoding':'binary'
  }, function(err, res, body){
    var ext = path.extname(res.req.path);
    console.log('photo req path: ' + res.req.path);
    console.log('photo ext: ' + ext);
		var filename = uuid.v4();
    var filepath = path.resolve(__dirname,'../../',uploadsDir) + '/' + filename + ext;

    self.original = uploadsDir + '/' + filename + ext;
    self.extension = ext;
    
    fs.writeFile(filepath,body,'binary',function(err) {
      if(err) cb(err,null);
      cb(null,self.original);
    });
  	
	});
});

// pre save hooks
PhotoSchema.pre('save', function(next) {
  var sizeResp = {
    'i':photoUrl + this.id + '_i' + this.extension,
    'f':photoUrl + this.id + '_f' + this.extension,
    'p':photoUrl + this.id + '_p' + this.extension,
    't':photoUrl + this.id + '_t' + this.extension
  };

  this.paths = sizeResp;
  next();
})

mongoose.model('Photo', PhotoSchema)
