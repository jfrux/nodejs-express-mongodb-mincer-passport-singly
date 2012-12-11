var mongoose = require('mongoose')
  , Photo = mongoose.model('Photo')
  , uploadProgress = require('node-upload-progress')
  , uploadHandler = new uploadProgress.UploadHandler;

function customOnEndHandler(req, res){      
  res.writeHead(200, {'Content-Type': 'text/plain'})
  res.end('Upload received');
}

uploadHandler.configure(function() {
	this.uploadDir = '/Users/rountrjf/Sites/ojects/public/photo/uploads';
  this.onEnd = customOnEndHandler;
});

exports.upload = function (req, res) {
  res.render('upload', {
      title: 'Upload Photos'
  })
}

exports.doUpload = function (req, res) {
	uploadHandler.upload(req, res)
}


exports.progress = function (req, res) {
	console.log('in uploadProgress');
  	console.log(uploadHandler.progress(req, res))
  	res
}