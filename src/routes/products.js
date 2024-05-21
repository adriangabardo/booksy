const express = require("express");
const apicache = require("apicache");

const { db } = require("../utils/db");
const { merge_where_str } = require("../utils/merge_where_str");

const router = express.Router();
const cache = apicache.middleware;

router.get("/", cache("5 minutes"), (req, res) => {
  const { searchValue, authors, tags, price, years } = req.query;

  console.log("GET authors", authors);

  let base_statement = "SELECT * FROM products";

  const authorsArr = Array.isArray(authors) ? authors : [authors];
  const tagsArr = Array.isArray(tags) ? tags : [tags];
  const yearsArr = Array.isArray(years) ? years : [years];

  // Appends WHERE statements for the searchValue into our base SELECT statement
  base_statement += merge_where_str(
    { searchValue: ["title", "description"], authors: ["author"], tags: ["tags"], years: ["year"] },
    { searchValue: [searchValue], authors: authorsArr, tags: tagsArr, years: yearsArr }
  );

  if (price && price > 0) {
    let price_statement = `CAST(price AS REAL) <= ${price}`;

    if (base_statement.includes("WHERE")) price_statement = " OR " + price_statement;
    else price_statement = " WHERE " + price_statement;

    base_statement += price_statement;
  }

  console.log("base_statement", base_statement);

  db.all(base_statement, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Database error: " + err.message);
    }

    res.render("index", {
      products: rows.map((product) => ({ ...product, tags: JSON.parse(product.tags) })),
    });
  });
});

router.get("/product/:productID", cache("5 minutes"), (req, res) => {
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
