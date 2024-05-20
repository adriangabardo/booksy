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

    res.locals.cartId = cartId;

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

router.delete("/cart", (req, res) => {
  const { cartId, productId } = req.query;

  console.log("Received DELETE cart request", req.query);

  if (!cartId) res.status(400).send("Missing cartId");

  const deleteCheckoutItemQuery = `DELETE FROM checkout_items WHERE checkoutId = ? AND productId = ?`;
  const deleteAllCheckoutItemsQuery = `DELETE FROM checkout_items WHERE checkoutId = ?`;
  const deleteCheckoutQuery = `DELETE FROM checkout WHERE id = ?`;

  db.serialize(() => {
    if (productId) {
      db.run(deleteCheckoutItemQuery, [cartId, productId], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).send("Error deleting checkout item");
        }

        console.log("Deleted single product, returning 204");

        // Return 204 - No Content
        return res.status(204).send();
      });
    } else {
      db.run(deleteAllCheckoutItemsQuery, [cartId], function (err) {
        if (err) {
          console.error(err.message);
          return res.status(500).send("Error deleting all checkout items");
        }

        db.run(deleteCheckoutQuery, [cartId], function (err) {
          if (err) {
            console.error(err.message);
            return res.status(500).send("Error deleting checkout");
          }

          return res.status(204).send();
        });
      });
    }
  });
});

router.get("/checkout/:cartId", (req, res) => {
  const { cartId } = req.params;

  if (!cartId) return res.status(400).send("cartId is required");

  const getCheckoutQuery = `SELECT * FROM checkout WHERE id = ?`;
  const getCheckoutItemsQuery = `SELECT * FROM checkout_items WHERE checkoutId = ?`;
  const getProductDetailsQuery = `SELECT * FROM products WHERE id = ?`;

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

      const productDetailsPromises = items.map(
        (item) =>
          new Promise((res, rej) => {
            db.get(getProductDetailsQuery, [item.productId], (err, product) => {
              if (err) return rej(err);
              res({ ...product, quantity: item.quantity, subtotal: product.price * item.quantity });
            });
          })
      );

      Promise.all(productDetailsPromises)
        .then((products) => {
          const subtotal = Math.round(
            products.reduce((previous, current) => {
              previous += current.subtotal;
              return previous;
            }, 0)
          );

          const taxes = Math.round(subtotal * 0.1);

          const total = Math.round(subtotal + taxes);

          const options = {
            checkout: { ...checkout, subtotal, total, taxes },
            products,
          };

          // res.status(200).json(options);

          res.render("checkout", options);
        })
        .catch((err) => {
          console.error(err.message);
          res.status(500).send("Error retrieving product details");
        });
    });
  });
});

router.post("/checkout/:cartId", (req, res) => {
  // res.status(200).json("OK!");
  res.redirect("/");
});

module.exports = { cartRouter: router };
