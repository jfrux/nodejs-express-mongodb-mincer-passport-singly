
/*
 *  Generic require login routing middleware
 */

requiresApproval = exports.requiresApproval = function (req, res, next) {
  if (req.isAuthenticated() && !req.user.approved) {
    return res.redirect('/signup/complete')
  }
  next()
};

exports.requiresLogin = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login')
  } else {
    return requiresApproval(req,res,next);
  }
  next()
};


/*
 *  User authorizations routing middleware
 */

exports.user = {
  hasAuthorization: function (req, res, next) {
    if (req.profile.id != req.user.id) {
      return res.redirect('/users/'+req.profile.id)
    }
    next()
  }
}

/*
 *  Project authorizations routing middleware
 */

exports.resource = {
  hasAuthorization : function (req, res, next) {
    if (req.resource.user.id != req.user.id) {
      return res.redirect('/resources/' + req.resource.id)
    }
    next()
  }
}


/*
 *  Project authorizations routing middleware
 */

exports.project = {
  hasAuthorization : function (req, res, next) {
    if (req.project.user.id != req.user.id) {
      return res.redirect('/projects/'+req.project.id)
    }
    next()
  }
}
