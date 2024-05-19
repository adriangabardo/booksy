const express = require("express");
const morgan = require("morgan");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid"); // To generate UUIDs

const navLinks = require("../data/links");

const app = express();
const port = 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Include the logging for all requests
app.use(morgan("common"));

// Tell our application to serve all the files under the `public_html` directory
app.use(express.static("public_html"));

// Connect to the SQLite3 database
const db = new sqlite3.Database("./booksy.db", (err) => {
  if (err) console.error(err.message);

  console.log("Connected to the feedback SQLite database.");
});

// ********************************************
// *** Other route/request handlers go here ***
// ********************************************

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/**
 * Set .navLinks as a global property for all templates to use
 */
app.use(async (req, res, next) => {
  const sql = "SELECT author, year, tags FROM products";

  const authorsFilter = [];
  const yearsFilter = [];
  const tagsFilter = [];

  await db.all(sql, [], (err, rows) => {
    if (err) console.error(err.message);

    rows.forEach((row) => {
      const { author, year, tags } = row;

      console.log({ author, year, tags });

      if (!authorsFilter.includes(author)) authorsFilter.push(author);
      if (!yearsFilter.includes(year)) yearsFilter.push(year);

      JSON.parse(tags).forEach((tag) => {
        if (!tagsFilter.includes(tag)) tagsFilter.push(tag);
      });
    });

    res.locals.filters = {
      authorsFilter,
      yearsFilter,
      tagsFilter,
    };

    res.locals.navLinks = navLinks;
    res.locals.minPrice = "5";
    res.locals.maxPrice = "100";

    return next();
  });
});

app.get("/", (req, res, next) => {
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

app.post("/cart", async (req, res) => {
  let { productId, cartId, quantity = 1 } = req.body;

  if (!cartId) {
    const ID = uuidv4();

    const createCheckoutQuery = `INSERT INTO checkout (id) VALUES (?)`;

    db.run(createCheckoutQuery, [ID], function (err) {
      if (err) {
        console.error(err.message);
        rej(err);
      }
    });

    cartId = ID;
  }

  const insertItemQuery = `
    INSERT INTO checkout_items (checkoutId, productId, quantity) VALUES (?, ?, ?)
  `;

  db.run(insertItemQuery, [cartId, productId, quantity], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error adding product to checkout_items");
    }

    res.status(201).send({ cartId });
  });
});

app.get("/cart", (req, res) => {
  const cartId = req.query.cartId;

  if (!cartId) return res.status(400).send("cartId is required");

  const getCheckoutQuery = `SELECT * FROM checkout WHERE id = ?`;

  const getCheckoutItemsQuery = `SELECT * FROM checkout_items WHERE checkoutId = ?`;

  db.get(getCheckoutQuery, [cartId], (err, checkout) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error retrieving checkout");
    }

    if (!checkout) {
      return res.status(404).send("Checkout not found");
    }

    db.all(getCheckoutItemsQuery, [cartId], (err, items) => {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Error retrieving checkout items");
      }

      res.status(200).json({
        checkout: cartId,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
    });
  });
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
  res.status(404).send(`<h1>404: File not found</h1>`);
});

app.use((error, req, res, next) => {
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  let errorStatus = error.status || 500;
  res.status(errorStatus);
  res.send("ERROR(" + errorStatus + "): " + error.toString());
});

// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, () => {
  // When the application starts, print to the console that our app is
  // running at http://localhost:3000. Print another message indicating
  // how to shut the server down.
  console.log(`Web server running at: http://localhost:${port}`);
  console.log(`Type Ctrl+C to shut down the web server`);
});
