const mongoose = require('mongoose');

const storyActivitySchema = new mongoose.Schema({
  story_name: {type:String, required:true},
  story_desc: {type: String, required:true},
  story_text:{type:String, required:true},
  Date:{type:Date,default:Date.now},
});

const storyActivity = mongoose.model('storyActivity', storyActivitySchema);
module.exports = storyActivity;
