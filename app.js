const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const dotenv = require("dotenv");
const fs = require('fs');

dotenv.config(); // ✅ .env load

const app = express();

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err.message));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static files (CSS, JS, images ke liye)

// uploads folder ko public bana do
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session Middleware
app.use(session({
  secret: "secretKey123",   // 🔑 Isse .env me bhi daal sakte ho
  resave: false,
  saveUninitialized: true
}));

// Flash Middleware
app.use(flash());

// Global Variables (flash messages ko res.locals me dalna)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;  
  next();
});


// Upload folder path
const uploadPath = path.join(__dirname, 'public/uploads');
// Static files
app.use(express.static(path.join(__dirname, "public")));


// Check if folder exists, else create
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("✅ Uploads folder created at:", uploadPath);
}

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
const userRoutes = require("./routes/backend/userRoutes");
app.use("/", userRoutes);

const posRoutes = require("./routes/backend/posts");
app.use("/posts", posRoutes);

const admin_home = require('./routes/frontend/home');
app.use('/', admin_home);


// const postRoutes = require("./routes/frontend/postRoutes");

// app.use("/", postRoutes); // frontend ke liye

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
