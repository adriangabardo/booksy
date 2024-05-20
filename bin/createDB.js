const products = require("../data/products");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./booksy.db", (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  }
  console.log("Connected to the booksy SQlite database.");
});

db.serialize(() => {
  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON;");

  db.run(
    `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        author TEXT,
        year YEAR, 
        price MONEY,
        image TEXT,
        tags TEXT
    )`,
    (err) => {
      if (err) {
        console.error(err.message);
        throw err;
      }

      console.log("Table created successfully.");
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS checkout (
      id TEXT PRIMARY KEY,
      status TEXT CHECK(status IN ('OPEN', 'FINISHED')) NOT NULL DEFAULT 'OPEN'
    )`,
    (err) => {
      if (err) {
        console.error(err.message);
        throw err;
      }

      console.log("Checkout table created successfully.");
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS checkout_items (
      checkoutId TEXT,
      productId TEXT,
      quantity INTEGER,
      PRIMARY KEY (checkoutId, productId),
      FOREIGN KEY (checkoutId) REFERENCES checkout(id),
      FOREIGN KEY (productId) REFERENCES products(id)
    )`,
    (err) => {
      if (err) {
        console.error(err.message);
        throw err;
      }

      console.log("Checkout items table created successfully.");
    }
  );

  const insertProduct = db.prepare(
    `INSERT INTO products (title, description, price, image, year, author, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  console.log("products", products);

  products.forEach((product) => {
    insertProduct.run(
      product.title,
      product.description,
      product.price,
      product.image,
      product.year,
      product.author,
      JSON.stringify(product.tags)
    );
  });

  insertProduct.finalize((err) => {
    if (err) console.error(err.message);
    else console.log("Products inserted successfully.");
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
      throw err;
    }

    console.log("Closed the database connection.");
  });
});
