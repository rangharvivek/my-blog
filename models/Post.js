const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
  title: String,
  content: String,
  image: String,
  categories: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);
