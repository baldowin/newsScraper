var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  // who is leaving the comment
  user: String,
  // what they are saying
  text: {
    type:String,
    required:true
  }
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
