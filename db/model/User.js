var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    id: {type: String, get: function(){ return this._id.toHexString(); } },
    username: {type: String, unique: true, required:true, validate:[validateusername, "Username not valid. Must be min 3 characters"]},
    password: {type: String, required: true, validate:[validatePass, "Password not valid. Must be min 8 characters"]},
    surveys: [{type: mongoose.Schema.ObjectId, ref: 'Surveys'}] //, ref: SurveyModel.Survey
});

//check password: cb(err, result), result=true is password is correct
userSchema.methods.authenticate = function(plainPassword, cb){
  bcrypt.compare(plainPassword, this.password, function(err, result){cb(err, result);})
};

//returns validation error as an object {username: 'some error', password: 'some other error'}
userSchema.methods.parseValidationError = function(){
  if (!this.errors) return;
  var error = {username: '', password: ''};
  if (this.errors.username) error.username = this.errors.username.message;
  if (this.errors.password) error.password = this.errors.password.message;
  //console.log(error);
  return error;
}

//encrypt password before saving to db
userSchema.pre('save', function(next){
  this.password = bcrypt.hashSync(this.password);
  next();
})


//validate username
function validateusername(username){
  if (typeof username !== 'string') return false;
  var re = /^[A-Za-z\d_-]{3,20}$/;
  return re.test(username);
}

//validate password
function validatePass(pass){
  if (typeof pass !== 'string') return false;
  var re = /^[A-Za-z\d!@#$%^&*]{8,20}$/;
  return re.test(pass);
}



//User Model
exports.User = function(connection){
  var Model = connection.model('User', userSchema);
  return Model;
}