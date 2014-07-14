//dependencies
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var flash = require("connect-flash");
var config = require('../config');
var secret = require('../secrets.json');

//db
var db = require("../db/dbconnect.js")(config.dbname + process.env.NODE_ENV);
var User = db.models.User;
var Session = db.models.Session;
var Survey = db.models.Survey;

//environment expiration variables
var envExpVariables = require('../config.js').expirationVariables(process.env.NODE_ENV);


exports.main = function(req,res){
  if (req.params.user !== req.currentUser) { res.redirect('/' + req.currentUser); return; }
  //res.send("CONTROL PANEL. Session OK, param: " + req.params.user + " Current user is: " + req.currentUser);
  res.render('controlPanel/controlPanel.jade', {currentUser: req.currentUser});
}


exports.addSurvey = function(req,res){
  //if (req.params.user !== req.currentUser) { res.redirect('/' + req.currentUser); return; }

  //res.render('controlPanel/controlPanel.jade', {currentUser: req.currentUser}); 
  var survey = new Survey({
    title: "Survey 2",
/*
      question: [{
      question: "Question 1",
      widget: "Widget 1",
      data: ["data1", "data2"]
    }],
*/
    publicLink: "public link here"
  });

  survey.save(function(err, savedSurvey){
    User.findOne( {username: 'qqq'}, function(err, user){
      //survey.
      user.surveys.push(survey._id);
      user.password="12345678";

      user.save( function(err, savedUser){ 
        if (err) res.send(err);

        User.findOne({username: 'qqq'})
        .populate('surveys')
        .exec(function(err, u){ 
            console.log(u); res.send(u); return;
        })

      });

    })
  });
}



