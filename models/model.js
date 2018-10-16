var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var urlSchema = new Schema({
    term:String,
    when:String
});

var latestImage = mongoose.model('latestImage', urlSchema);

module.exports = latestImage;
