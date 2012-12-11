var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , _ = require("underscore")

exports.signin = function (req, res) {}

// auth callback
exports.authCallback = function (req, res, next) {
  if(!req.user.approved) {
    res.redirect('/signup/complete');
  } else {
    res.redirect('/');
  }
}

// login
exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login'
  })
}

exports.complete = function (req, res) {
  console.log(req.user);
  res.render('users/complete', {
    title: 'Complete your registration...',
    user:req.user
  })
  
}

// sign up
exports.signup = function (req, res) {
  console.log(req.user);
  if(req.isAuthenticated()) {
    res.render('users/signup_finish', {
      title: 'Complete your registration...'
    })
  } else {
    res.render('users/signup', {
      title: 'Sign up'
    })
  }
  
}

// logout
exports.logout = function (req, res) {
  req.logout()
  res.redirect('/login')
}

// session
exports.session = function (req, res) {
  res.redirect('/')
}

// signup_finish_create
exports.complete_save = function (req, res) {
  var user = req.user;

  user = _.extend(user, req.body)
  user.provider = 'local';
  user.save(function (err) {
    if (err) return res.render('users/complete', { title:'Complete your registration...',user:user,errors: err.errors })
    user.approved = true;
    user.save(function(err) {
      if (err) return next(err)
      req.logIn(user, function(err) {
        if (err) return next(err)
        
        return res.redirect('/')
      });  
    });
    
  })
}

// signup
exports.create = function (req, res) {
  var user = new User(req.body)
  user.provider = 'local'
  user.save(function (err) {
    if (err) return res.render('users/signup', { errors: err.errors })
    req.logIn(user, function(err) {
      if (err) return next(err)
      return res.redirect('/')
    })
  })
}

exports.follow = function (req, res) {
  var follower = req.user;
  var leader = req.profile;

  //update followers of leader
  var leaderCondition = { _id: leader._id };
  var leaderUpdate = {$addToSet:{followers: follower._id}};
  var leaderOptions = {};

  var followerCondition = { _id: follower._id };
  var followerUpdate = {$addToSet:{following: leader._id}};
  var followerOptions = {};
  var state = 'follow';
  //check if already following, if so, unfollow
  if(leader.followers.indexOf(follower._id) > -1) {
    state = 'unfollow'
    leaderUpdate = {$pull:{followers: follower._id}};
    followerUpdate = {$pull:{following: leader._id}};
  }

  User.update(leaderCondition,leaderUpdate,leaderOptions,function(err,newLeader) {
    if(err) res.write(JSON.stringify("failed"));
      
    //after leader follow is successful... update the follower.
    //update following of follower
    User.update(followerCondition,followerUpdate,followerOptions,function(err,newFollower) {
      if(err) res.write(JSON.stringify("failed"));

      if(newFollower) {
        res.write(JSON.stringify('success'));

        if(state == 'follow') {
          res.airmail.send('emails/follow/html', 
            { user:leader, //user is always required
              follower:follower },
            {to: req.user.email, subject: req.user.name + " started following you on myapp" },
            function(err, mail) {
              if(err) return console.log(err);
          });  
        }
        
        res.end();  
      }
      
    });
  });
}

// show profile
exports.show = function (req, res) {
  var user = req.profile
  if(user.followers.indexOf(req.user._id) > -1) {
    console.log("is following");
    user.isFollowing = true;
  } else {
    console.log("not following");
    user.isFollowing = false;
  }
  
  res.render('users/show', {
      title: user.name + ' (' + user.username + ') on ' + res.locals.appName
    , user: user
  })
}

exports.activity = function (req, res) {
  var user = req.profile
  res.render('users/activity', {
      title: user.name + ' (' + user.username + ') on ' + res.locals.appName
    , user: user
  });
}

exports.areas = function (req, res) {
  var user = req.profile
  res.render('users/areas', {
      title: user.name + ' (' + user.username + ') on ' + res.locals.appName
    , user: user
  });
}

