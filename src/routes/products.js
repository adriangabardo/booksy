const express = require("express");
const router = express.Router();
const { db } = require("../utils/db");
const { merge_where_str } = require("../utils/merge_where_str");

router.get("/", (req, res) => {
  const { searchValue, authors, tags } = req.query;

  console.log("GET authors", authors);

  let base_statement = "SELECT * FROM products";

  const authorsArr = Array.isArray(authors) ? authors : [authors];
  const tagsArr = Array.isArray(tags) ? tags : [tags];

  // Appends WHERE statements for the searchValue into our base SELECT statement
  base_statement += merge_where_str(
    { searchValue: ["title", "description"], authors: ["author"], tags: ["tags"] },
    { searchValue: [searchValue], authors: authorsArr, tags: tagsArr }
  );

  console.log("base_statement", base_statement);

  db.all(base_statement, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Database error: " + err.message);
    }

    res.locals.filters.minPrice = Math.floor(Math.min(...rows.map((row) => row.price)));
    res.locals.filters.maxPrice = Math.round(Math.max(...rows.map((row) => row.price))) + 5;

    res.render("index", {
      products: rows.map((product) => ({ ...product, tags: JSON.parse(product.tags) })),
    });
  });
});

router.get("/product/:productID", (req, res) => {
  const { productID } = req.params;

  console.log("productID", productID);

  let base_statement = "SELECT * FROM products WHERE id = ?";

  db.get(base_statement, productID, (err, product) => {
    if (err) {
      console.error(err);
      res.status(500).send(err.message);
    }

    console.log({ product });

    return res.render("product", {
      product: product,
    });
  });
});

module.exports = { productsRouter: router };
