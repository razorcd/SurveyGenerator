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

  User.findOne( {username : req.currentUser}, 'surveys').populate('surveys').exec(function(err, user){
    res.render('controlPanel/controlPanel.jade', {currentUser: req.currentUser, surveylist: user.surveys});    
  })
}


exports.addSurvey = function(req,res){
  //if (req.params.user !== req.currentUser) { res.redirect('/' + req.currentUser); return; }

  //res.render('controlPanel/controlPanel.jade', {currentUser: req.currentUser}); 
  var survey = req.body.survey;
    console.log(survey);

    survey = new Survey(survey);



  survey.save(function(err, savedSurvey){
    if (err) { res.send(400, err); return; }

    User.findOne( {username: 'qqq'})   //TODO:  change 'qqq' to req.currentUser
    .select('surveys')
    .exec( function(err, user){
      
      user.surveys.push(survey._id); // add survey.id to the current user
      
      user.save( function(err, savedUser){ 
        if (err) { res.send(400, err); return; }

        //just to display. Can be deleted
        User.findOne({username: 'qqq'})
        .populate('surveys')
        .exec(function(err, u){ 
            console.log(u);
        })

        res.send(200);
      });

    })
  });
}



exports.addNewSurvey = function(req, res){
  res.render('Survey/addNewSurvey.jade', {currentUser: req.currentUser});
}

exports.getSurveyField = function(req,res){
  var selectedField = req.params.selectedField;
  res.render('Survey/surveyFields.jade', {selectedField: selectedField});
}