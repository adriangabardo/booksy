const navLinks = require("../../data/links");
const { db } = require("../utils/db");

const set_locals = async (req, res, next) => {
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
};

module.exports = { set_locals };
