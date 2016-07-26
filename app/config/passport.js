module.exports = function(app){
var passport = require('passport');
var session = require('express-session');
var User = require('../model/User');
var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
var authConfig  = require('./auth.js');


//express setting

////now using CookieSession

//app.use(cookieSession({key:'node' , secret:'jasonhsieh00',maxAge :300000 }));

//// below is normal centralized-session




// passport and express setting
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


app.use(session({ secret: 'ilovescotchscotchyscotchscotch',cookie: {maxAge: 6000000 }})); // session secret

//// !!! 這兩個順序亂改的話 SESSION會壞掉 !!!!!!
app.use(passport.initialize());
app.use(passport.session());
//// !!! 以上 這兩個順序亂改的話 SESSION會壞掉 !!!!!!

// end passport and express setting

//// passport : localStrategy setting



 var LocalStrategy = require('passport-local').Strategy;

  passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        //return done(null,false,req.flash('signupMessage', 'That email is already taken.'));
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var confirm = req.body.confirm;

    req.checkBody('name','Name is required!!').notEmpty();
    req.checkBody('email','Email is required!!').notEmpty();
    req.checkBody('email','Wrong email ').isEmail();
    req.checkBody('username','Username is required!!').notEmpty();
    req.checkBody('password','Password is required!!').notEmpty();
    req.checkBody('confirm','Confirm password is not requal to the password').equals(req.body.password);



    var errors = req.validationErrors();

    if(errors){
                 return done(null,false,req.flash('signupMessage', req.validationErrors()));

    }
    else{ 
    
   

            var newUser = new User();
            newUser.name = name;
            newUser.email = email;
            newUser.username = username;
            newUser.password = password;
            newUser.admin = false;
            newUser.create_at = new Date();
            newUser.updated_at = new Date();

            User.findOne({'username':username},function(err,user){
                if(err) throw err;

                if(user){

                  var usernameDuplicateError =   { param: 'username', msg: 'Username has been used!!', value: '' } 
                  var errors = [];
                  errors.push(usernameDuplicateError);

                    if(errors){
                                   
                     return done(null,false,req.flash('signupMessage', errors));

                        
                    }
                }
                else{
                    User.createUser(newUser,function(err,user){
                if(err) throw err;

                      done( null, user );

            }); 
                }
            });
            
           
    }
 
}));

//// signin in local Strategy

  passport.use('local-signin', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        //return done(null,false,req.flash('signupMessage', 'That email is already taken.'));
   
    var username = req.body.username;
    var password = req.body.password;

    
    req.checkBody('username','Username is required!!').notEmpty();
    req.checkBody('password','Password is required!!').notEmpty();



    var errors = req.validationErrors();

    if(errors){
                 return done(null,false,req.flash('signinMessage', req.validationErrors()));

    }
    else{ 
    
   

            User.findOne({'username':username},function(err,user){
                if(err) throw err;

                if(user){
                    console.log('I have found a user');
                    if(User.comparePassword(password,user.password)){
                      done( null, user );
                    }
                    else{
                var usernameDuplicateError =   { param: 'username', msg: 'Username or password is wrong!!', value: '' } 
                  var errors = [];
                  errors.push(usernameDuplicateError);
                   done(null,false,req.flash('signinMessage', errors))                    }

                 
                }
                else{
                    console.log('no users');

                  var usernameDuplicateError =   { param: 'username', msg: 'Username or password is wrong!!', value: '' } 
                  var errors = [];
                  errors.push(usernameDuplicateError);
                   done(null,false,req.flash('signinMessage', errors))
                }
            });
            
           
    }
 
}));


//// passport : Facebook setting
var FacebookStrategy = require('passport-facebook').Strategy;
var FACEBOOK_APP_ID = '1645285015798856';
var FACEBOOK_APP_SECRET = '94bfa12f5203b7ddcc1f956bf0a2da15';

passport.use(new FacebookStrategy({
    clientID: authConfig.facebook.APP_ID,
    clientSecret: authConfig.facebook.APP_SECRET,
    callbackURL:authConfig.facebook.CALLBACK_URL
    },  
    function(accessToken,resreshToken,profile,done){
        User.findOne({'facebook_id':profile.id},function(err,user){
            if(err) throw err;

            if(user){
                        return done(null,user);

            }else{
                var newUser = new User();
                newUser.facebook_id = profile.id;
                newUser.name = profile.displayName;
                newUser.admin = false;
                newUser.create_at = new Date();
                newUser.updated_at = new Date();
                //newUser.email = profile.emails[0].value;

                User.createUser(newUser,function(err,user){
                    if(err) throw err;


                    return done(null, user);

                });
            }
        });
    }
));
//// end passport : Facebook setting

// passport : Google setting
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var GoogleClientId = authConfig.google.APP_ID;
var GoogleClientSecret = authConfig.google.APP_SECRET;
var GoogleCallbackURL = authConfig.google.CALLBACK_URL;
passport.use(new GoogleStrategy({

        clientID        : GoogleClientId,
        clientSecret    : GoogleClientSecret,
        callbackURL     : GoogleCallbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {
       User.findOne({'google_id':profile.id},function(err,user){
            if(err) throw err;

            if(user){
                
                        return done(null,user);

            }else{
                var newUser = new User();
                newUser.google_id = profile.id;
                newUser.name = profile.displayName;
                newUser.admin = false;
                newUser.create_at = new Date();
                newUser.updated_at = new Date();
                //newUser.email = profile.emails[0].value;

                User.createUser(newUser,function(err,user){
                    if(err) throw err;


                    return done(null, user);

                });
            }
        });
        

    }));



// passport : github setting
var GithubStrategy = require('passport-github2').Strategy;
var GithubClientId = authConfig.github.APP_ID;
var GithubClientSecret = authConfig.github.APP_SECRET;
var GithubCallbackUrl = authConfig.github.CALLBACK_URL;
passport.use(new GithubStrategy({

        clientID        : GithubClientId,
        clientSecret    : GithubClientSecret,
        callbackURL     : GithubCallbackUrl

    },
    function(req, token, refreshToken, profile, done) {
      User.findOne({'github_id':profile.id},function(err,user){
            if(err) throw err;

            if(user){
                        return done(null,user);

            }else{
                var newUser = new User();
                newUser.github_id = profile.id;
                newUser.name = profile.username;
                newUser.admin = false;
                newUser.create_at = new Date();
                newUser.updated_at = new Date();
                //newUser.email = profile.emails[0].value;

                User.createUser(newUser,function(err,user){
                    if(err) throw err;


                    return done(null, user);

                });
            }
        });
        

    }));






function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
}