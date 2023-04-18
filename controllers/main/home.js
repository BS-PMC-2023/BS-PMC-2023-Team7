/*[ Import ]*/
const express = require("express");
const router = express.Router();
const { Recipe } = require("../../models/recipe");

router.get("/home", async (req, res) => {
  const session = req.session;
  const recipes = await Recipe.fetchRecipes(session.filter || null, session.sort || null);
  res.render("template", {
    pageTitle: "Dishcraft - Homepage",
    page: "home",
    recipes: recipes,
    user: session.user || null,
  });
});

router.post("/home", async (req, res) => {
  const session = req.session;
  const smt = req.body.submit;
});

/*[ External access ]*/
module.exports = router;
