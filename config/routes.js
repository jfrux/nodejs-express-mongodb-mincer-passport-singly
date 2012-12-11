var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , async = require('async')

module.exports = function (app, passport, auth) {
  // user routes
  var users = require('../app/controllers/users')
  app.get('/login', users.login)
  app.get('/signup', users.signup)
  app.get('/signup/complete', users.complete)
  app.post('/signup/complete', users.complete_save)
  app.get('/logout', users.logout)
  app.post('/users', users.create)
  app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login'}), users.session)

  // GET /auth/singly/callback
  // Use passport.authenticate() as route middleware to authenticate the
  // request. If authentication fails, the user will be redirected back to the
  // login page. Otherwise, the primary route function function will be called,
  // which, in this example, will redirect the user to the home page.
  app.get('/auth/callback', passport.authenticate('singly', {
    failureRedirect: '/login'
  }),users.authCallback);

  // GET /auth/singly
  // Use passport.authenticate() as route middleware to authenticate the
  // request. The first step in Singly authentication will involve
  // redirecting the user to api.singly.com. After authorization, Singly will
  // redirect the user back to this application at /auth/singly/callback
  app.get('/auth/singly', passport.authenticate('singly'));
 
  // photos routes
  var photos = require('../app/controllers/photos')
  app.get('/photos/upload', photos.upload)
  app.post('/photos/upload', photos.doUpload);

  var emailPreview = require('../app/controllers/emailpreview')
  app.get('/emailpreview/:template', emailPreview.show)

  // user settings
  var settings = require('../app/controllers/settings')
  app.get('/settings', auth.requiresLogin, settings.profile)
  app.get('/settings/profile', auth.requiresLogin, settings.profile)
  app.get('/settings/password', auth.requiresLogin, settings.password)
  app.get('/settings/invite', auth.requiresLogin, settings.invite)
  app.get('/settings/delete', auth.requiresLogin, settings.delete)

  app.param('username', function (req, res, next, id) {
    console.error('XXX: Loading user', id);

    User
      .findOne({ username : id })
      .populate('picture')
      .exec(function (err, user) {
        if (err) return next(err)
        if (!user) return next(new Error('Failed to load User ' + id))
        //console.log(user);
        req.profile = user
        next()
      })
  })
  
  var front = require('../app/controllers/front')
  // home route
  app.get('/', function(req,res) {
    if(req.isAuthenticated()) {
      users.show(req,res);
    } else {
      front.home(req,res);
    }
  });

  // comment routes
  var comments = require('../app/controllers/comments')

  //faker data
  // app.get('/generate/users',function(req,res) {
  //   var Faker = require('Faker');

  //   var bigSet = [];

  //   for(i = 20; i >= 0; i--){
  //     bigSet.push({
  //       "name":Faker.Name.findName(),
  //       "username":Faker.Internet.userName(),
  //       "email":Faker.Internet.email()
  //     });
  //   };

  //   fs.writeFile('../examples/bigDataSet.json', JSON.stringify(bigSet), function() {
  //     sys.puts("bigDataSet generated successfully!");
  //   });

  //   var randomName = Faker.Name.findName(); // Rowan Nikolaus
  //   var randomEmail = Faker.Internet.email(); // Kassandra.Haley@erich.biz
  //   var randomCard = Faker.Helpers.createCard(); // random contact card containing many properties
  // });
  
  //USER ROUTES
  app.get('/:username', users.show)
  app.get('/:username/follow', users.follow)
  app.get('/:username/areas', users.areas)
  app.get('/:username/activity', users.activity)
}
