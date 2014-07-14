var mongoose = require('mongoose');


var surveySchema = mongoose.Schema({
  id: {type: String, get: function(){ return this._id.toHexString(); } },
  title: {type: String, required: true },
  // questions: [{
  //               question:String,
  //               widget: String,
  //               data: Array
  //             }],
   publicLink: String
   //creator: {type: mongoose.Schema.ObjectId, ref: User }
});


//User Model
exports.Survey = function(db){
  var Model = db.model('Surveys', surveySchema);
  return Model;
}