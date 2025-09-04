const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Post = require("../../models/Post");

// ========== Multer Storage ==========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // sirf uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// ========== GET all posts ==========
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render("backend/posts", { posts, message: req.flash("message") });
  } catch (err) {
    console.log(err);
    req.flash("message", "❌ Error fetching posts");
    res.redirect("/");
  }
});

// ========== Create Post Form ==========
router.get("/create", (req, res) => {
  res.render("backend/create-post", { message: req.flash("message") });
});

// ========== Create Post ==========
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content,
categories: req.body.categories,
      tags: req.body.tags,
      image: req.file ? req.file.filename : null,
    });
    console.log(newPost)
    await newPost.save();
    req.flash("message", "✅ Post created successfully!");
    res.redirect("/posts");
  } catch (err) {
    console.log(err);
    req.flash("message", "❌ Error creating post");
    res.redirect("/posts/create");
  }
});

// ========== Edit Post Form ==========
router.get("/edit/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render("backend/edit-post", { post, message: req.flash("message") });
  } catch (err) {
    req.flash("message", "❌ Error loading post for edit");
    res.redirect("/posts");
  }
});

// ========== Update Post ==========
router.post("/edit/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      content: req.body.content,
      categories: req.body.categories,
      tags: req.body.tags,
    };
    if (req.file) {
      updateData.image = req.file.filename;
    }
    await Post.findByIdAndUpdate(req.params.id, updateData);
    req.flash("message", "✅ Post updated successfully!");
    res.redirect("/posts");
  } catch (err) {
    req.flash("message", "❌ Error updating post");
    res.redirect("/posts");
  }
});

// ========== Delete Post ==========
router.get("/delete/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    req.flash("message", "✅ Post deleted successfully!");
    res.redirect("/posts");
  } catch (err) {
    req.flash("message", "❌ Error deleting post");
    res.redirect("/posts");
  }
});





// postRoutes.js

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found");

    // fetch 5 related/latest posts (excluding current post)
    const relatedPosts = await Post.find({ _id: { $ne: post._id } }).limit(5);
    const categories = await Post.distinct("categories");

    res.render("frontend/detail", { post, relatedPosts,categories  }); // ✅ pass here
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


module.exports = router;
