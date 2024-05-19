const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const { db } = require("../utils/db");

router.post("/cart", async (req, res) => {
  let { productId, cartId, quantity = 1 } = req.body;

  /**
   * If a cartId is not passed in, we generate a new UUID
   * and create a new row in the database before we relate productIds to it
   */
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

  /**
   * Inserts a new product to the existing cart.
   * In case of CONFLICT, then updates the existing entry adding the new quantity to the existing quantity.
   */
  const insertItemQuery = `
    INSERT INTO checkout_items (checkoutId, productId, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(checkoutId, productId) DO UPDATE SET
        quantity = quantity + excluded.quantity
  `;

  db.run(insertItemQuery, [cartId, productId, quantity], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error adding product to checkout_items");
    }

    res.status(201).send({ cartId });
  });
});

router.get("/cart", (req, res) => {
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

module.exports = { cartRouter: router };
