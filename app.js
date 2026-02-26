const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Post = require("./models/post");
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

function isLoggedin(req, res, next){
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");
  jwt.verify(token, "privateKey", (err, decoded) => {
    if (err) return res.redirect("/login");
    req.user = decoded;
    next();
  })
}

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/upload", (req, res) => {
  res.render("multer");
})

app.post("/upload", (req, res) => {
  
})

app.get("/profile", isLoggedin, async (req, res) => {
  const { email, userid } = req.user;
  const user = await User.findById(userid).populate("posts") ;
  if (user) res.render("profile", { user });
  else res.send("User not found");
});

app.get("/like/:id", isLoggedin, async (req, res) => {
  const { userid } = req.user;
  let post = await Post.findById(req.params.id).populate("user");
  if (post.likes.includes(userid)) {
    post.likes.splice(post.likes.indexOf(userid), 1);
  } else {
    post.likes.push(userid);
  }
  await post.save();
  res.redirect("/profile");
});

app.get("/edit/:id", isLoggedin, async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render("edit", { post })
});

app.post("/update/:id", isLoggedin, async (req, res) => {
  const { content } = req.body;
  const post = await Post.findByIdAndUpdate(req.params.id, { content });
  res.redirect("/profile");
})

app.post("/register", async (req, res) => {
  const { username, name, email, age, password } = req.body;
  let user = await User.findOne({ email });
  if (user) return res.status(400).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) return res.status(500).send("Error hashing password");
      user = await User.create({
        username,
        email,
        age,
        password:hash,
        name
      });
      const token = jwt.sign({email, userid: user._id }, "privateKey");
      res.cookie("token", token);
      res.redirect("/profile");
    })
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send("Something went wrong");

  bcrypt.compare(password, user.password, (err, result) => {
    if (err) return res.status(500).send("Something went wrong");
    if (result) {
      const token = jwt.sign({email: user.email, userid: user._id}, "privateKey");
      res.cookie("token", token);
      res.redirect("/profile");
    }
  })
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.post("/post", isLoggedin, async (req, res) => {
  const { content } = req.body;
  const { userid } = req.user;
  const user = await User.findById(userid);
  if (user) {
    const post = await Post.create({
      user: userid,
      content
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  } else {
    res.send("User not found");
  }
})


app.listen(PORT, () => {
    console.log(`Userflow app listening on port ${PORT}`);
});