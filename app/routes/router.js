var User = require('../model/User');
var Vote = require('../model/Vote');
// var moment = require('moment')();

module.exports = function (app, passport) {
    // local routes

    app.get('/', function (req, res) {
        Vote.find({}).sort({created_at: -1}).limit(20).lean().exec(function(err, votes) {
    if(err) {throw err;    }
    else{
            for(var i=0 ; i< votes.length ; i++){
            votes[i].dateStr = votes[i].created_at.getFullYear()+'-'+votes[i].created_at.getMonth()+'-'+
            votes[i].created_at.getDay()+' '+votes[i].created_at.getHours()+':'+votes[i].created_at.getMinutes();
            }

             if (req.isAuthenticated()) {
            res.render('home', {
                homeClass: 'class="active"',
                displayName: req.user.name,
                votes:votes
            });

        }
        else {
            res.render('home', { 
                homeClass: 'class="active"' ,
                votes:votes
            });

        }

    }
        });
       

    });

    app.get(
        '/check',
        function (req, res) {
            res.send(req.isAuthenticated());
            // res.send(req.user);
        }
    );

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });



    app.get('/register', function (req, res) {
        if (req.isAuthenticated()) {
            res.render('register', {
                errors: errors,
                registerClass: 'class="active"',
                displayName: req.user.name
            });

        }
        else {
            res.render('register', { errors: errors, registerClass: 'class="active"' });

        }
        var errors = req.flash('signupMessage');


    });

    // app.get('/test',passport.authenticate('local'));
    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/myinfo', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: 'Invalid username or password.' // allow flash messages
    }));

    app.get('/login', function (req, res) {

        var errors = req.flash('signinMessage');

        if (req.isAuthenticated()) {
            res.render('login', {
                errors: errors,
                loginClass: 'class="active"',
                displayName: req.user.name
            });

        }
        else {
            res.render('login', { errors: errors, loginClass: 'class="active"' });

        }

    });

    app.post('/login', passport.authenticate('local-signin', {
        successRedirect: '/createVote', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: 'Invalid username or password.' // allow flash messages
    }));


    app.get('/myinfo', isLoggedIn, function (req, res) {

        if (req.isAuthenticated()) {
            res.render('myinfo', {
                myinfoClass: 'class="active"',
                displayName: req.user.name,
                user: req.user
            });

        }
        else {
            res.render('myinfo', { myinfoClass: 'class="active"' });

        }
    });

    //Upload profile picture
    var path = require('path');
    var multer = require('multer')
    var options = multer.diskStorage({
        destination: './public/profile',
        filename: function (req, file, cb) {
            cb(null, req.user._id + path.extname(file.originalname));
        }
    });

    var upload = multer({ storage: options });

    app.post('/myinfo', isLoggedIn, upload.single('pic'), function (req, res, next) {
        var filename = req.file.filename;
        res.end(filename);
    });
    //End Upload profile picture

    // update user info
    app.post('/updateMyinfo', isLoggedIn, function (req, res) {
        User.findByIdAndUpdate(req.user._id, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                updated_at: new Date()
            }
        }, { new: true }, function (err, user) {  //用findByIdAndUpdate更新完之後 如果沒加參數{new:true}的話 callback裡面的user會是舊的

            if (err) throw err;

            req.login(user, function (error) { //用passport的方法重新登入 整個req.user才會更新
                if (!error) {
                }
            });

            res.sendStatus(200);
        });

    });

    //end update user info


    //voting routes
    app.get('/createVote', isLoggedIn, function (req, res) {

        Vote.find({ user_id: req.user._id }, function (err, votes) {
            console.log(votes);
            res.render('createVote', { voteClass: 'class="active"', displayName: req.user.name, votes: votes });

        });


    });


     app.post('/createVote', isLoggedIn, function (req, res) {
        console.log(req.body);
        var options = [];
        var results = [];
        for (var prop in req.body) {
            if (prop == 'voteName') { }
            else {
                options.push(req.body[prop]);
                results.push(1);
            }
        }
       
        //// insert new Vote
        var vote = new Vote({
            user_id: req.user._id,
            name: req.body.voteName,
            options: options,
            results: results,
            created_at:  new Date(),
            updated_at: new Date(),
            voters: []
        });

        vote.save(function (err, vote) {
            if (err) throw err;
            console.log(vote);
            console.log('vote saved!!');
        });

        res.redirect('/createVote');
    });





    app.get('/vote/:id', function (req, res) {


        Vote.findById(req.params.id, function (err, vote) {
            // this id is created by mongodb
            if (!vote) { res.render('vote', { error: 'Wrong URL !! No this vote please check URL !!' }); return; };

            var voteName = '"' + vote.name + '"';
            var optionData = [];
            var htmlId = 0;
            var optionDataStr = '[';
            for (var i = 0; i < vote.options.length; i++) {
                optionData.push({ y: vote.results[i], indexLabel: vote.options[i], htmlId: htmlId++ });
                optionDataStr += '{y:' + vote.results[i].toString() + ',indexLabel:"' + vote.options[i].toString() + '"},';
            }
            optionDataStr = optionDataStr.substring(0, optionDataStr.length - 1) + ']';
            console.log(optionDataStr);

            if (req.isAuthenticated()) {          //有登入 send displayName
                if (vote.voters.indexOf(req.user._id) !== -1) {     //有投過票 render voted:true

                    res.render('vote', {
                        voteName: voteName.toString(),
                        optionData: optionData,
                        optionDataStr: optionDataStr,
                        voteId: vote._id, voted: true, displayName: req.user.name
                    });
                    return;
                }
                else {
                   
                    res.render('vote', {
                        voteName: voteName.toString(),
                        optionData: optionData,
                        optionDataStr: optionDataStr,
                        voteId: vote._id,
                        displayName: req.user.name
                    });
                    return;
                }

            }
            else {                       //沒登入 no displayName
                console.log('i didnt login');
                res.render('vote', {
                    voteName: voteName.toString(),
                    optionData: optionData,
                    optionDataStr: optionDataStr,
                    voteId: vote._id
                });
            }

        });



    })
        .delete('/vote/:id', function (req, res) {
            Vote.find({ _id:req.params.id , user_id:req.user._id }, function (err, vote) {
                if (err) throw err;

                // delete him
                vote[0].remove(function (err) {
                    if (err) throw err;

                res.sendStatus(200);
                });

                
            });


        });

    app.post('/updateVote/:id', isLoggedIn, function (req, res) {


        Vote.findOne({ _id: req.params.id }, function (err, vote) {
            if (err) throw err;

            console.log(vote);

            vote.results[req.body.radio]++;
            vote.voters.push(req.user._id);
            console.log(vote);

            vote.markModified('results');
            vote.markModified('voter');


            console.log(vote);
            vote.save();

        });

        res.redirect('/vote/' + req.params.id);

    });




   
    //end voting routes






    //// github route
    app.get('/auth/github', passport.authenticate('github', { scope: ['user'] }));

    app.get('/auth/github/callback', passport.authenticate('github', {
        successRedirect: '/myinfo',
        failureRedirect: '/login'
    }));
    //// end github route


    //// google route
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect: '/myinfo',
        failureRedirect: '/login'
    }));
    //// end google route

    //// facebook route
    app.get('/auth/facebook', passport.authenticate('facebook'));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/myinfo',
        failureRedirect: '/login'
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
