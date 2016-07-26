var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var app = express();
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var exphbs  = require('express-handlebars');
var flash    = require('connect-flash');
var morgan = require('morgan');


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(flash()); // use connect-flash for flash messages stored in session

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use(expressValidator([]));
app.use( bodyParser.json() );
app.use( passport.initialize() );
app.use(morgan('dev'));

require('./app/config/db.js')(mongoose);
require('./app/config/passport.js')(app);
require('./app/routes/router.js')(app,passport);

app.listen(80);

console.log('listening to 80'); 