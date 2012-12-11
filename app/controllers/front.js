var mongoose = require('mongoose')

exports.home = function (req, res) {
  res.render('front/home', {
      title: res.locals.appName
  })
}