const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/userflow");

const user = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  age: Number,
  password: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ]
});

module.exports = mongoose.model("User", user);