const mongoose = require("mongoose");

const post = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  content: String,
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  date: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model("Post", post);