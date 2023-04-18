/*[ Import ]*/
const express = require("express");
const router = express.Router();

router.get("/recipeupload", async (req, res) => {
  var session = req.session;
  res.render("template", {
    pageTitle: "Dishcraft - Recipe Craft",
    page: "createRecipe",
    user: session.user || null,
  });
});

/*[ External access ]*/
module.exports = router;