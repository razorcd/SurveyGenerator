//dependencies
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var flash = require("connect-flash");
var config = require('../config');
var secret = require('../secrets.json');

//db
var db = exports.db = require("../db/dbconnect.js")(config.dbname + process.env.NODE_ENV);
var User = db.models.User || require('../db/model/User.js').User(db);
var Session = db.models.Session || require('../db/model/Session.js').Session(db);

//environment expiration variables
var envExpVariables = require('../config.js').expirationVariables(process.env.NODE_ENV);


exports.main = function(req,res){
  if (req.params.user !== req.currentUser) {
    //res.send("Wrong user/Not accessible: " + req.currentUser); //res.redirect('/' + req.currentUser);
    res.redirect('/' + req.currentUser);
    return;
  }
  //res.send("CONTROL PANEL. Session OK, param: " + req.params.user + " Current user is: " + req.currentUser);
  res.render('controlPanel/controlPanel.jade', {currentUser: req.currentUser});
}