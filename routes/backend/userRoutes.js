const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../../models/User");

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  req.flash("error", "Please login first");
  res.redirect("/login");
}

router.get("/register", (req, res) => {
  res.render("backend/register", { messages: req.flash() });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      req.flash("error", "Email already exists");
      return res.redirect("/register");
    }

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password
    });
    await newUser.save();

    req.flash("success", "User registered successfully");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/register");
  }
});

router.get("/login", (req, res) => {
  res.render("backend/login", { messages: req.flash() });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid password");
      return res.redirect("/login");
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    req.flash("success", "Login successful");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/login");
  }
});


router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search ? req.query.search.trim() : "";

    const searchFilter = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const totalUsers = await User.countDocuments(searchFilter);

    const users = await User.find(searchFilter)
      .select("-password")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.render("backend/dashboard", {
      users,
      messages: req.flash(),
      user: req.session.user,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      searchQuery: search
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to fetch users");
    res.redirect("/login");
  }
});

router.get("/users/:id/edit", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/dashboard");
    }
    res.render("editUser", { user, messages: req.flash() });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/dashboard");
  }
});



router.get("/users/:id/edit", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/dashboard");
    }
    res.render("editUser", { user, messages: req.flash() });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/dashboard");
  }
});

router.post("/users/:id/edit", isAuthenticated, async (req, res) => {
  try {
    const { username, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, { username, email });
    req.flash("success", "User updated successfully");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to update user");
    res.redirect("/dashboard");
  }
});


router.post("/users/:id/delete", isAuthenticated, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash("success", "User deleted successfully");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to delete user");
    res.redirect("/dashboard");
  }
});


router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;
