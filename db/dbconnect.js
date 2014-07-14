var mongoose = require('mongoose');
var env = process.env.NODE_ENV;
var config = require('../config.js');


//creates a db connection
function getDbConnection(dbName){
  
  //console.log('Creating db connection.');
  var dbconnection;

  //checking if DB with that name already exists
  mongoose.connections.forEach(function(c){
      if (c.name === dbName) dbconnection = c;
    });

  if (dbconnection) return dbconnection;

  //creating a new db
  dbconnection = mongoose.createConnection(config.host, dbName); 

  dbconnection.on('error', function(err){
    console.log("Error on DB connection: ", err);
  });

  dbconnection.once('open', function callback () {
    console.log("DB connection open ...");
  });

    return dbconnection;
}




module.exports = function(dbName){
    var connection = getDbConnection(dbName);

    var Survey = connection.models.Survey || require('./model/Survey.js').Survey(connection);
    var Session = connection.models.Session || require('./model/Session.js').Session(connection);
    var User = connection.models.User || require('./model/User.js').User(connection);



    return {
      connection: connection,
      models: {
                Survey:  Survey,
                Session: Session,
                User:    User
              }
    } 

};


