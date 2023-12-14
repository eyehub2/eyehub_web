
const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  username: {type:String, required:true},
  activity_type: {type: String, default: ''},
  score:{type:Number, required:true},
  duration:{type:String, default:''},
  text:{type:String},
  text_score:{type:String}
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
module.exports = UserActivity;
