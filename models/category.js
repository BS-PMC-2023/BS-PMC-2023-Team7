//[Import]
const mongoose = require("mongoose");
const { schemas } = require("../schemas/paths");
const { capitalize, offloadFields } = require("../utils");

class Category {
  constructor(details, id) {
    if (details) offloadFields(["id", "categoryName", "categoryType", "ingredients"], this, details);
    else this.id = id;
  }

  //find category for ingredients and return text or object
  static async findCategory(ingredients, type, text, lowerCase) {
    var alg = [];
    for (const ing of ingredients) {
      let categories;
      if (type) categories = await schemas.Category.find({ ingredients: ing.name.toLowerCase(), categoryType: type });
      else categories = await schemas.Category.find({ ingredients: ing.name.toLowerCase() });
      if (categories && categories.length > 0)
        for (const category of categories)
          if (lowerCase) alg.push(category.categoryName.toLowerCase());
          else alg.push(category.categoryName);
    }
    alg = Array.from(new Set(alg)); //remove duplicates
    if (text) return alg.length > 0 ? alg.join(", ") + "." : "None.";
    return alg;
  }
  //find category/categories by name
  static async findCategoryByName(name, multiple) {
    if (multiple) return await schemas.Category.find({ categoryName: name });
    return await schemas.Category.findOne({ categoryName: name });
  }

  async addIngredToCategory(ingredient) {
    try {
      await this.fetchCategory();
      this.ingredients.push(ingredient);
      await schemas.Category.updateOne({ _id: this.id }, { ingredients: this.ingredients });
      return true;
    } catch {
      return false;
    }
  }

  async deleteIngredFromCategory(index) {
    try {
      await this.fetchCategory();
      this.ingredients.splice(index, 1);
      await schemas.Category.updateOne({ _id: this.id }, { ingredients: this.ingredients });
      return true;
    } catch {
      return false;
    }
  }

  //get all the categories from db
  static async fetchAllCategories() {
    let categories = await schemas.Category.find({});
    return categories || [];
  }

  //get all the categories from db
  static async fetchCategories(type, format) {
    let categories = await schemas.Category.find({ categoryType: type });
    if (!format) return categories || [];
    const filter = categories.map((cat) => {
      var n = cat.categoryName;
      var v = type == "allergy" ? `${n}-Free` : type == "diet" ? n.replace("Non-", "").replace("non-", "") : n;
      return { name: v, value: n };
    });
    return filter;
  }

  //fetch category from db
  async fetchCategory() {
    let details = await schemas.Category.findOne({ _id: this.id });
    if (details) {
      offloadFields(["id", "categoryName", "categoryType", "ingredients"], this, details);
      return true;
    }
    return false;
  }

  //check if the ingredient exist in this category
  checkIngredInCategory(ingredient) {
    if (this.ingredients.includes(ingredient.toLowerCase())) {
      return true;
    }
    return false;
  }
}

/*[ External access ]*/
module.exports = { Category };
