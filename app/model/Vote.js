var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var voteSchema = new Schema({
    user_id:String,
    name:String,
    options:Array,
    results:Array,
    created_at:Date,
    updated_at:Date,
    voters : Array
});



var Vote  = mongoose.model('Vote',voteSchema);

module.exports = Vote;
