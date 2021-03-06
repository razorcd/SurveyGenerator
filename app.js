
 // Module dependencies.
var http = require('http');
var path = require('path');

var express = require('express');
var methodOverride = require('method-override');
var flash = require("connect-flash");
//var mongoose = require('mongoose');

var config = require('./config.js');
var secret = require('./secrets.json');

//routes functions
var user = require('./routes/user.js');
var controlpanel = require('./routes/controlpanel.js');
var routes = require('./routes');

var app = express();

// all environments
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser()); //{store:MongoStore(mongoStoreConnectionArgs)} ));
app.use(express.session( {
  //cookie: {maxAge: 1000},
  secret: secret.session,
  //store: new MongoStore({ mongoose_connection: mongoose.connections[0] })
}));
app.use(flash());
app.use(methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// test only
if ('test' == app.get('env')) {
  app.use(express.errorHandler());

  //create/connect to db
  var db = require("./db/dbconnect.js")(config.dbname + process.env.NODE_ENV);

  //delete all users first
  var User = db.models.User;//db.models.User || require('./db/model/User.js').User(db);         //change  .. to . in boilerplate
  User.find().remove().exec(function(){
    //execute jasmine tests in new process
    var exec = require('child_process').exec;
    var e = exec('jasmine-node test/app-spec.js --config APP_PORT ' + app.get('port'), function(err, stdout,stderr){
      console.log("\nJASMINE TEST RESULTS:");
      if(err) console.log(err)
      if (stderr) console.log(stderr)
        else {console.log(stdout);}
    });
  });
};    

//base routes
app.get('/', routes.index);


//*** user routes ***
app.get('/register', user.register_get);
app.post('/register', user.register_post)
app.get('/login', user.login_get);
app.post('/login', user.login_post)
app.get('/logout', user.logout)
app.get('/redirect', user.redirect);
//*** user routes END ***


// *** test routes ****
app.get('/expirations',user.expirations );
app.get('/checkLoginSession', user.checkLogin, user.checkLoginSession);
// *** test routes END ****

// *** Control Panel Routes ***
app.get('/:user/addnewsurvey', controlpanel.addNewSurvey);
app.get('/getSurveyField/:selectedField', controlpanel.getSurveyField);
app.post('/addsurvey', controlpanel.addSurvey);
app.get('/:user', user.checkLogin, controlpanel.main);
// *** Control Panel Routes END***



//CREATE SERVER
http.createServer(app).listen(app.get('port'), function(){
  console.log(' ------------------- Express server listening on port ' + app.get('port') + ' -------------------');
  console.log("Process environment:", app.get('env'));
});
