var mongoose = require('mongoose')
  , User = mongoose.model('User')

exports.show = function (req,res) {
	var tmpl = 'emails/' + req.emailTemplate + '/html';
	res.airmail.send(tmpl, 
	  { user:req.user },
	  {to: req.user.email, subject: "Welcome to Bilddit!" }, 
	  function(err, mail) {
	    console.log("sending email...");
	    if(err) return console.log(err);
	    console.log("MAIL: sent!");
	    res.end()
	 });
  res.render(tmpl, {
      user: req.user
  })
}