var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , request = require("request")

exports.profile = function (req, res) {
  res.render('settings/profile', {
      title: res.locals.appName + ' / Settings / Edit Profile'
  })
}

exports.password = function (req, res) {
	res.render('settings/password', {
      title: res.locals.appName + ' / Settings / Change Password'
  })
}

exports.invite = function (req, res) {
	res.render('settings/invite', {
      title: res.locals.appName + ' / Settings / Invite Friends'
  })
}

exports.delete = function (req, res) {
  console.log("test");
  request.del('https://api.singly.com/profiles?access_token=' + req.user.accessToken,function(err,res,body) {
    console.log(arguments);
  })
  req.user.remove();

  res.render('settings/delete', {
      title: res.locals.appName + ' / Settings / Delete Myself'
  })
}