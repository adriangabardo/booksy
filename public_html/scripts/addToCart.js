function addToCart(productId, productName) {
  let cartId;

  try {
    const cart = localStorage.getItem("cart");
    if (cart) {
      const { checkout } = JSON.parse(cart);
      cartId = checkout;
    }
  } catch {
    console.warn("Failed to retrieve any existing cart.");
  }

  fetch("/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId: productId, cartId }),
  })
    .then((response) => response.json())
    .then((data) => {
      fetch(`/cart?cartId=${data.cartId}`, { method: "GET" })
        .then((response) => response.json())
        .then((cart) => {
          // Set the cart item in localStorage
          localStorage.setItem("cart", JSON.stringify(cart));

          // Dispatch an event for other components to listen to and know our cart has changed
          window.dispatchEvent(new Event("cartChange"));

          // Dispatch an event for other components to listen to and know a product was added
          window.dispatchEvent(
            new CustomEvent("alertDispatched", {
              detail: {
                header: "Book added to cart",
                body: productName,
              },
            })
          );
        })
        .catch((error) => {
          console.error("Failed to retrieve cart:", error);
        });
    })
    .catch((error) => {
      console.error("Failed to add to cart:", error);
    });
}
