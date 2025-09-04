const express = require('express');
const router = express.Router();
const Post = require("../../models/Post");

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find({}).lean(); // MongoDB se data fetch karo
        res.render("frontend/home", { posts });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching data");
    }
});



module.exports = router;
