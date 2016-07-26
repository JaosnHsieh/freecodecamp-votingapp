var User = require('../model/User');

module.exports = function(app,passport){
// local routes

app.get('/', function (req, res) {
            if(req.isAuthenticated()){
                 res.render('home',{
                     homeClass:'class="active"',
                 displayName:req.user.name
                });
    
            }
            else{
                res.render('home',{homeClass:'class="active"'});

            }
           
});

app.get(
  '/check',
  function( req, res ) {
    res.send( req.isAuthenticated() );
    // res.send(req.user);
  }
);

app.get('/logout',function(req,res){
     req.logout();
    res.redirect('/');
});



app.get('/register',function(req,res){
            if(req.isAuthenticated()){
        res.render('register',{
            errors: errors , 
            registerClass:'class="active"' ,
            displayName:req.user.name
            });

            }
            else{
    res.render('register',{errors: errors , registerClass:'class="active"'});

            }
    var errors = req.flash('signupMessage');


});

// app.get('/test',passport.authenticate('local'));
app.post('/register', passport.authenticate('local-signup', {
         successRedirect : '/myinfo', // redirect to the secure profile section
         failureRedirect : '/register', // redirect back to the signup page if there is an error
         failureFlash : 'Invalid username or password.' // allow flash messages
     }));

app.get('/login',function(req,res){

    var errors = req.flash('signinMessage');

    if(req.isAuthenticated()){
    res.render('login',{
        errors: errors,
        loginClass:'class="active"',
        displayName:req.user.name
     });

    }
    else{
    res.render('login',{errors: errors,loginClass:'class="active"' });

    }

});

app.post('/login',passport.authenticate('local-signin', {
         successRedirect : '/myinfo', // redirect to the secure profile section
         failureRedirect : '/login', // redirect back to the signup page if there is an error
         failureFlash : 'Invalid username or password.' // allow flash messages
     }));


app.get('/myinfo',isLoggedIn,function(req,res){
    
        if(req.isAuthenticated()){
            res.render('myinfo',{
                myinfoClass:'class="active"',
                displayName:req.user.name,
                user:req.user
            });

        }
        else{
             res.render('myinfo',{myinfoClass:'class="active"'});

        }
});

//Upload profile picture
var path  = require('path');
var multer  = require('multer')
var options = multer.diskStorage({ destination : './public/profile' ,
        filename: function (req, file, cb) { 
          cb(null,req.user._id+path.extname(file.originalname));
        }
      });

var upload= multer({ storage: options });

app.post('/myinfo', isLoggedIn,upload.single('pic'), function (req, res, next) {
var filename = req.file.filename;
res.end(filename);
});
//End Upload profile picture

// update user info
app.post('/updateMyinfo',isLoggedIn,function(req,res){
    User.findByIdAndUpdate(req.user._id,{$set:{
        name:req.body.name , 
        email:req.body.email,
        updated_at : new Date()
        }},{new:true},function(err,user){  //用findByIdAndUpdate更新完之後 如果沒加參數{new:true}的話 callback裡面的user會是舊的

    if(err) throw err;

    req.login(user, function(error) { //用passport的方法重新登入 整個req.user才會更新
    if (!error) {
    }
});    

    res.sendStatus(200);
});
   
});
 
 //end update user info







// end local routes

//// github route
app.get('/auth/github',passport.authenticate('github',{scope:['user']}));

app.get('/auth/github/callback',passport.authenticate('github',{
    successRedirect: '/myinfo',
    failureRedirect : '/login'
}));
//// end github route


//// google route
app.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));

app.get('/auth/google/callback',passport.authenticate('google',{
    successRedirect: '/myinfo',
    failureRedirect : '/login'
}));
//// end google route

//// facebook route
app.get('/auth/facebook',passport.authenticate('facebook'));

app.get('/auth/facebook/callback',passport.authenticate('facebook',{
    successRedirect: '/myinfo',
    failureRedirect : '/login'
}));

//// end  facebook route
}

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
