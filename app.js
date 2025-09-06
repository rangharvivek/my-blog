const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const dotenv = require("dotenv");
const fs = require('fs');

dotenv.config(); 
const app = express();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err.message));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(session({
  secret: "secretKey123",   
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;  
  next();
});


const uploadPath = path.join(__dirname, 'public/uploads');

app.use(express.static(path.join(__dirname, "public")));


if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("✅ Uploads folder created at:", uploadPath);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const userRoutes = require("./routes/backend/userRoutes");
app.use("/", userRoutes);

const posRoutes = require("./routes/backend/posts");
app.use("/posts", posRoutes);

const admin_home = require('./routes/frontend/home');
app.use('/', admin_home);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
