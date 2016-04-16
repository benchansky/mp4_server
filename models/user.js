// Load required packages
var mongoose = require('mongoose');

// Define our beer schema
var UserSchema   = new mongoose.Schema({
  name: String,
  email: {type:String, unique: true},
  pendingTasks: [String],
  dateCreated: Date
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
