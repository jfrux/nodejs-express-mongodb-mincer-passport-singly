
var mongoose = require('mongoose')
  , LocalStrategy = require('passport-local').Strategy
  , SinglyStrategy = require('passport-singly').Strategy
  , Photo = mongoose.model('Photo')
  , User = mongoose.model('User')


exports.boot = function (passport, config) {
  // require('./initializer')

  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }).populate('picture','name paths').exec(function (err, user) {
      done(err, user)
    })
  })

  // use local strategy
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(fld, password, done) {
      console.error('XXX: LocalStrategy called');

      User.findOne({$or: [{username: fld}, {email: fld}]}).exec(function (err, user) {
        if (err) { return done(err) }
        if (!user) {
          return done(null, false, { message: 'Unknown user' })
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'Invalid password' })
        }
        return done(null, user)
      })
    }
  ))
  
  passport.use(new SinglyStrategy({
      clientID: config.singly.clientID,
      clientSecret: config.singly.clientSecret,
      callbackURL: config.singly.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      var p = profile;
      var cb = done;
      var token = accessToken;
      console.log('accessToken: ' + accessToken);
      User.findOne({'singly.id': p.id }, function (err, user) {
        if(err) return cb(err, user);
        
        console.log('looked for user...');
        if (!user) {
          console.log('no user found...');
          
          var user = new User({
              name: p.displayName
            , email: p.emails[0].value
            , provider: 'singly'
            , singly: p._json
            , accessToken: token
          });

          //update services
          //console.log(p._json.services);

          console.log('creating user...');
          
          user.save(function(err) {
            console.log('user.save completed, err: ' + err);

            if(err) return(new Error(err));

            console.log('user saved!');
            //download and save photo into image system
            //console.log(p);
            if(p._json.thumbnail_url && p._json.thumbnail_url.length) {
              console.log("Has Photo: " + p._json.thumbnail_url);
              var photo = new Photo();
              photo.uploadedBy = user._id;

              photo.download(p._json.thumbnail_url,function(err,photopath) {
                if(err) return cb(err,null);
                
                photo.process(function(err) {
                  photo.save(function (err) {
                    if (err) throw err;

                    user.picture = photo._id;

                    user.save(function(err) {
                      if(err) return cb(err,null);
                      console.log("Picture saved to User record.");

                      cb(null, user);
                    });
                  });
                });
              });
            } else {
              console.log("No photo to save.");

              cb(null, user);
            }
          });
        } else {
          console.log("User already exists...");
          user.accessToken = token;

          user.save(function(err) {
            if(err) return cb(new Error('User found but could not save accessToken'),user);
            cb(null, user);
          });
        }
      })
    }
  ));
}
