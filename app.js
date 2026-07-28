const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Database
function loadDB() {
  if (!fs.existsSync("database.json")) {
    return {
      users: [],
      posts: [],
      topics: [],
      messages: [],
      notifications: [],
      reports: []
    };
  }

  return JSON.parse(fs.readFileSync("database.json", "utf8"));
}

function saveDB(db) {
  fs.writeFileSync(
    "database.json",
    JSON.stringify(db, null, 2)
  );
}

// Multer Upload
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

// Home
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
// =========================
// REGISTER
// =========================
app.post("/register", (req, res) => {

  const { username, password } = req.body;

  const db = loadDB();

  if (!username || !password) {
    return res.json({
      success: false,
      message: "Fill all fields"
    });
  }

  const exists = db.users.find(
    user => user.username === username
  );

  if (exists) {
    return res.json({
      success: false,
      message: "Username already exists"
    });
  }

  db.users.push({
    id: Date.now(),
    username,
    password,
    subscription: "Free",
    profilePhoto: "",
    banned: false,
    created_at: new Date().toISOString()
  });

  saveDB(db);

  res.json({
    success: true,
    message: "Account created successfully"
  });

});


// =========================
// LOGIN
// =========================
app.post("/login", (req, res) => {

  const { username, password } = req.body;

  const db = loadDB();

  const user = db.users.find(
    u =>
      u.username === username &&
      u.password === password
  );

  if (!user) {

    return res.json({
      success: false,
      message: "Invalid username or password"
    });

  }

  if (user.banned) {

    return res.json({
      success: false,
      message: "Your account has been banned"
    });

  }

  res.json({
    success: true,
    message: "Login successful",
    user
  });

});
// =========================
// CREATE TEXT POST
// =========================
app.post("/admin/post", (req, res) => {

  const {
    username,
    password,
    type,
    title,
    content
  } = req.body;

  if (
    username !== "admin" ||
    password !== "admin123"
  ) {
    return res.json({
      success: false,
      message: "Invalid admin credentials"
    });
  }

  const db = loadDB();

  db.posts.unshift({
    id: Date.now(),
    type: type || "text",
    title,
    content,
    filename: "",
    likes: 0,
    likedBy: [],
    comments: [],
    created_at: new Date().toISOString()
  });

  saveDB(db);

  res.json({
    success: true,
    message: "Post published successfully"
  });

});


// =========================
// UPLOAD PHOTO / VIDEO / AUDIO
// =========================
app.post(
  "/upload",
  upload.single("media"),
  (req, res) => {

    if (!req.file) {

      return res.json({
        success: false,
        message: "No file selected"
      });

    }

    let type = "file";

    if (req.file.mimetype.startsWith("image/")) {

      type = "photo";

    } else if (
      req.file.mimetype.startsWith("video/")
    ) {

      type = "video";

    } else if (
      req.file.mimetype.startsWith("audio/")
    ) {

      type = "audio";

    }

    const db = loadDB();

    db.posts.unshift({

      id: Date.now(),

      type,

      title: "",

      content: "",

      filename: req.file.filename,

      likes: 0,

      likedBy: [],

      comments: [],

      created_at: new Date().toISOString()

    });

    saveDB(db);

    res.json({

      success: true,

      message: type + " uploaded successfully"

    });

  }
);


// =========================
// LOAD POSTS
// =========================
app.get("/posts", (req, res) => {

  const db = loadDB();

  res.json(db.posts);

});
// =========================
// LIKE POST
// =========================
app.post("/post/:id/like", (req, res) => {

  const id = Number(req.params.id);

  const db = loadDB();

  const post = db.posts.find(p => p.id === id);

  if (!post) {
    return res.json({
      success: false,
      message: "Post not found"
    });
  }

  post.likes = (post.likes || 0) + 1;

  saveDB(db);

  res.json({
    success: true,
    likes: post.likes
  });

});


// =========================
// COMMENT
// =========================
app.post("/post/:id/comment", (req, res) => {

  const id = Number(req.params.id);

  const { comment } = req.body;

  const db = loadDB();

  const post = db.posts.find(p => p.id === id);

  if (!post) {

    return res.json({
      success: false,
      message: "Post not found"
    });

  }

  if (!post.comments) {
    post.comments = [];
  }

  post.comments.push({
    text: comment,
    created_at: new Date().toISOString()
  });

  saveDB(db);

  res.json({
    success: true,
    comments: post.comments
  });

});


// =========================
// USER TOPICS
// =========================
app.post("/topics", (req, res) => {

  const { username, topic } = req.body;

  const db = loadDB();

  db.topics.unshift({
    id: Date.now(),
    username,
    topic,
    created_at: new Date().toISOString()
  });

  saveDB(db);

  res.json({
    success: true,
    message: "Topic submitted"
  });

});

app.get("/topics", (req, res) => {

  const db = loadDB();

  res.json(db.topics);

});


// =========================
// ADMIN USERS
// =========================
app.get("/admin/users", (req, res) => {

  const db = loadDB();

  res.json(db.users);

});


// =========================
// ADMIN STATS
// =========================
app.get("/admin/stats", (req, res) => {

  const db = loadDB();

  let totalLikes = 0;

  db.posts.forEach(post => {
    totalLikes += post.likes || 0;
  });

  res.json({
    users: db.users.length,
    posts: db.posts.length,
    topics: db.topics.length,
    likes: totalLikes
  });

});


// =========================
// START SERVER
// =========================
app.put("/admin/post/:id", (req, res) => {

  const id = Number(req.params.id);

  const {
    username,
    password,
    type,
    title,
    content
  } = req.body;

  if (
    username !== "admin" ||
    password !== "admin123"
  ) {
    return res.json({
      success: false,
      message: "Invalid admin credentials"
    });
  }

  const db = loadDB();

  const post = db.posts.find(
    p => p.id === id
  );

  if (!post) {
    return res.json({
      success: false,
      message: "Post not found"
    });
  }

  post.type = type;
  post.title = title;
  post.content = content;

  saveDB(db);

  res.json({
    success: true,
    message: "Post updated successfully"
  });

});
app.delete("/admin/post/:id", (req, res) => {

  const id = Number(req.params.id);

  const db = loadDB();

  db.posts = db.posts.filter(
    p => p.id !== id
  );

  saveDB(db);

  res.json({
    success: true,
    message: "Post deleted"
  });

});
app.delete("/admin/user/:id", (req, res) => {

  const id = Number(req.params.id);

  const db = loadDB();

  db.users = db.users.filter(
    u => u.id !== id
  );

  saveDB(db);

  res.json({
    success: true,
    message: "User deleted"
  });

});
app.put("/admin/user/:id/ban", (req, res) => {

  const id = Number(req.params.id);

  const db = loadDB();

  const user = db.users.find(
    u => u.id === id
  );

  if (!user) {

    return res.json({
      success: false,
      message: "User not found"
    });

  }

  user.banned = !user.banned;

  saveDB(db);

  res.json({
    success: true,
    banned: user.banned
  });

});
app.listen(PORT, () => {

  console.log("================================");

  console.log("I&I v2 Running");

  console.log("http://localhost:" + PORT);

  console.log("================================");

});
