module.exports = function(mongoose){
    var dbUrl = 'mongodb://localhost:27017/test';
    mongoose.connect(dbUrl);
};