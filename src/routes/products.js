const express = require("express");
const router = express.Router();
const { db } = require("../utils/db");

router.get("/", (req, res) => {
  const { searchValue } = req.query;

  res.locals.searchValue = searchValue;

  const sql = searchValue
    ? `SELECT * FROM products WHERE LOWER(title) LIKE LOWER('%${res.locals.searchValue}%') OR description LIKE LOWER('%${res.locals.searchValue}%')`
    : "SELECT * FROM products";

  console.log("sql", sql);

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Database error: " + err.message);
    }

    console.log("products", rows);

    res.locals.minPrice = Math.floor(Math.min(...rows.map((row) => row.price)));
    res.locals.maxPrice = Math.round(Math.max(...rows.map((row) => row.price))) + 5;

    res.render("index", {
      products: rows.map((product) => ({ ...product, tags: JSON.parse(product.tags) })),
    });
  });
});

module.exports = { productsRouter: router };
