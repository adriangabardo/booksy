const express = require("express");
const morgan = require("morgan");
const path = require("path");

const { db } = require("./utils/db");
const { cartRouter } = require("./routes/cart");
const { set_locals } = require("./middleware/locals");
const { productsRouter } = require("./routes/products");

const app = express();
const port = 3000;

// Middleware to parse JSON payloads
app.use(express.json());

// Middleware to parse URLEncoded payloads
app.use(express.urlencoded({ extended: true }));

// Include the logging for all requests
app.use(morgan("common"));

// Tell our application to serve all the files under the `public_html` directory
app.use(express.static("public_html"));

// view engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

// Use middleware to set necessary .locals variables
app.use(set_locals);

// Use extra routers
app.use("/", productsRouter);
app.use("/", cartRouter);

// The 404 Route (ALWAYS Keep this as the last route)
app.get("*", function (req, res) {
  res.status(404).send(`<h1>404: File not found</h1>`);
});

app.use((error, req, res, next) => {
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  let errorStatus = error.status || 500;
  console.error(error);
  res.status(errorStatus);
  res.send("ERROR(" + errorStatus + "): " + error.toString());
});

// Tell our application to listen to requests at port 3000 on the localhost
const server = app.listen(port, () => {
  // When the application starts, print to the console that our app is
  // running at http://localhost:3000. Print another message indicating
  // how to shut the server down.
  console.log(`Web server running at: http://localhost:${port}`);
  console.log(`Type Ctrl+C to shut down the web server`);
});

/**
 * Listening to SIGTERM to close the DB connection.
 */
process.on("SIGTERM", () => {
  debug("SIGTERM signal received: closing HTTP server");
  db.close();
  server.close(() => {
    debug("HTTP server closed");
  });
});
