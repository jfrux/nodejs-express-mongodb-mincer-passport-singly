
/**
 * Module dependencies.
 */

var express = require('express')
  , mongoStore = require('connect-mongodb')
  , path = require("path")
  , _ = require("underscore")
  , helpers = require('./config/helpers')
  , ejs = require("ejs")
  , Singly = require("singly")

var airmail = require('express-airmail');

exports.boot = function(app, config, passport){
  bootApplication(app, config, passport)
}

// App settings and middleware
function bootApplication(app, config, passport) {
  var hostBaseUrl = (config.domain || 'http://localhost:' + port);
  var apiBaseUrl = process.env.SINGLY_API_HOST || 'https://api.singly.com';
  var singly = new Singly(config.singly.clientId, config.singly.clientSecret, config.singly.callbackURL);

  app.set('showStackError', true)

  app.use(express.static(__dirname + '/public'))
  
  //forces domain to be whatever is in config
  if ('production' == process.env.NODE_ENV) {
   app.use( require('express-force-domain')(config.domain) ); 
  }

  app.use(express.logger(':method :url :status'))

  var Mincer  = require("mincer");
  var environment = require('./environment');
  
  var emailTransport = "SMTP";
  var emailConn = config.email;
  var emailDefaults = {
    from: "My App Name <no-reply@mysite.com>",
    //cc: "admin@nothere.org",
    subject: "Undefined Subject",
    baseurl: config.domain
  };

  app.configure(function () {
    app.set('singly',singly);
    // set views path, template engine and default layout
    app.set('views', __dirname + '/app/views')
    app.set('view engine', 'jade')

    app.use('/assets/', Mincer.createServer(environment));  
    // dynamic helpers
    var viewHelpers = {};


    // dummy helper that injects extension
    function rewrite_extension(source, ext) {
      var source_ext = path.extname(source);
      return (source_ext === ext) ? source : (source + ext);
    }


    // returns a list of asset paths
    function find_asset_paths(logicalPath, ext) {
      var asset = environment.findAsset(logicalPath),
          paths = [];

        if (!asset) {
          return null;
        }
        //console.log(process.env.NODE_ENV);
        if ('production' !== process.env.NODE_ENV && asset.isCompiled) {
          asset.toArray().forEach(function (dep) {
            paths.push('/assets/' + rewrite_extension(dep.logicalPath, ext) + '?body=1');
          });
        } else {
          paths.push('/assets/' + rewrite_extension(asset.digestPath, ext));
        }

        return paths;
      }
      viewHelpers.emailButton = function(label,link) {
        return '';
      }

      viewHelpers.javascript = function(logicalPath) {
        var paths = find_asset_paths(logicalPath, '.js');

        if (!paths) {
          // this will help us notify that given logicalPath is not found
          // without "breaking" view renderer
          return '<script type="application/javascript">alert("Javascript file ' +
                 JSON.stringify(logicalPath).replace(/"/g, '\\"') +
                 ' not found.")</script>';
        }

        return paths.map(function (path) {
          return '<script type="application/javascript" src="' + path + '"></script>';
        }).join('\n');
      };


      viewHelpers.stylesheet = function(logicalPath) {
        var paths = find_asset_paths(logicalPath, '.css');

        if (!paths) {
          // this will help us notify that given logicalPath is not found
          // without "breaking" view renderer
          return '<script type="application/javascript">alert("Stylesheet file ' +
                 JSON.stringify(logicalPath).replace(/"/g, '\\"') +
                 ' not found.")</script>';
        }

        return paths.map(function (path) {
          return '<link rel="stylesheet" type="text/css" href="' + path + '" />';
        }).join('\n');
      };

    //app.use(emailer);
    app.use(function (req, res, next) {
      
      res.locals.appName = 'My App Name'
      res.locals.title = 'My App Name'
      res.locals.singly = app.get('singly');
      res.locals.showStack = app.showStackError
      res.locals.req = req
      
      //append helpers (config/helpers.js)
      res.locals = _.extend(res.locals,helpers);
      environment.precompile(['application.js', 'application.css'], function (err) {
        if (err) {
          throw err;
          return;
        }
        res.locals = _.extend(res.locals,viewHelpers);
        
        next()
      });

    })

    // cookieParser should be above session
    app.use(express.cookieParser())

    // bodyParser should be above methodOverride
    app.use(express.bodyParser())
    app.use(express.methodOverride())

    app.use(airmail.init(emailTransport, emailConn, emailDefaults));

    app.use(express.session({
      secret: 'noobjs',
      store: new mongoStore({
        url: config.db,
        collection : 'sessions'
      })
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(express.favicon(__dirname + '/public/img/favicon.ico'))

    // routes should be at the last
    app.use(app.router)

    if("production" === process.env.NODE_ENV) {
      // assume "not found" in the error msgs
      // is a 404. this is somewhat silly, but
      // valid, you can do whatever you like, set
      // properties, use instanceof etc.
      app.use(function(err, req, res, next){
        // treat as 404
        if (~err.message.indexOf('not found')) return next()

        // log it
        console.error(err.stack)
        err.htmlStack = err.stack.replace('\n','<br />');
        // error page
        res.status(500).render('500',{
          error: err
        })
      })
    }
    
    // assume 404 since no middleware responded
    app.use(function(req, res, next){
      res.status(404).render('404', { url: req.originalUrl })
    })
  })

  app.configure('development', function() {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });
  app.set('showStackError', false)
}
