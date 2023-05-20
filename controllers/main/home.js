//[Import]
const express = require("express");
const router = express.Router();
//[Clases]
const { Recipe } = require("../../models/recipe");
const { Category, defCategories } = require("../../models/category");
//[Aid]
const { offloadFields } = require("../../utils");
const { sorts } = require("../../jsons/views.json");
var temp = require("../../jsons/views.json").defSearch;
temp.categories = defCategories;
const defSearch = Object.freeze(temp);
var filters;

router.get("/home", async (req, res) => {
  const session = req.session;
  session.clearAiFlag = true;
  if (!session.search) session.search = defSearch;
  const recipes = await Recipe.fetchRecipes(session.search);
  session.recipe = null;
  if (!filters)
    filters = {
      timeRange: 0,
      allergy: await Category.fetchCategories("allergy", true),
      diet: await Category.fetchCategories("diet", true),
    };

  res.render("template", {
    pageTitle: "Dishcraft - Homepage",
    page: "home",
    recipes: recipes,
    search: session.search,
    sorts: sorts,
    filters: filters,
    user: session.user,
  });
});

router.post("/home", async (req, res) => {
  const session = req.session;
  const smt = req.body.submit;
  const recipe = new Recipe(null, smt);
  //find recipe
  let successful = await recipe.fetchRecipe(session.user ? session.user.id : null);
  if (successful) {
    session.recipe = recipe;
    session.returnPage = "/home";
    return res.redirect("/recipe");
  }
  return res.redirect(req.get("referer"));
});
//look up recipe by name, author, or ingredient
router.post("/search", async (req, res) => {
  const session = req.session;
  const buttonPress = req.body.submit;
  if (!session.search) session.search = defSearch;
  switch (buttonPress) {
    case "home":
      session.search = defSearch;
      break;
    case "search":
      if (req.body.search) session.search.term = req.body.search.toLowerCase();
      else session.search.term = "";
      break;
    case "sortApply":
      session.search.sort = offloadFields(["category", "dir"], null, req.body);
      break;
    case "sortReset":
      session.search.sort = null;
      break;
    case "filterApply":
      session.search.filterRange = req.body.filterRange;
      if (Array.isArray(req.body.filter)) session.search.filter = req.body.filter;
      else session.search.filter = req.body.filter ? [req.body.filter] : null;
      break;
    case "filterReset":
      session.search.filterRange = "all";
      session.search.filter = null;
      break;
    default:
      return res.redirect(req.get("referer"));
  }
  return res.redirect("/home");
});

router.post("/updateCategories", async (req, res) => {
  const session = req.session;
  if (!session.search) session.search = defSearch;
  const categories = session.search.categories;
  const checkbox = req.body.categories;
  categories[checkbox] = !categories[checkbox];
  return res.redirect("/home");
});

/*[ External access ]*/
module.exports = router;
