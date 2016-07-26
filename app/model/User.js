var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    email:String,
    // username: {type:String , required:true , unique:true}, // uniqute will make err if there is dupilicated
    username: {type:String },
    // password:{type:String , required:true},
    password:{type:String},
    admin: Boolean,
    location: String,
    meta:{
        age:Number,
        website:String
    },
    created_at:Date,
    updated_at:Date,
    facebook_id:String,
    google_id:String,
    github_id:String
});

// userSchema.pre('save',function(next){

// });

var User  = mongoose.model('User',userSchema);

module.exports = User;
module.exports.createUser  = function(newUser,callback){
    
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
       newUser.password = hash;
       newUser.save(callback);
    });
});
}


module.exports.comparePassword  = function(password,hash){

return bcrypt.compareSync(password, hash);

}
