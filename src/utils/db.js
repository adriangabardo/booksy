const sqlite3 = require("sqlite3").verbose();

// Connect to the SQLite3 database
const db = new sqlite3.Database("./booksy.db", (err) => {
  if (err) console.error(err.message);

  console.log("Connected to the feedback SQLite database.");
});

module.exports = { db };
