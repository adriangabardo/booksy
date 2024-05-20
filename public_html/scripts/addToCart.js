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
    // Dispatch an event for other components to listen to and know a product was added
    window.dispatchEvent(
      new CustomEvent("alertDispatched", {
        detail: {
          header: "Failed to add to cart",
          body: `Failed to add ${productName}, please try again.`,
        },
      })
    );
    return;
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
      fetchCart(data.cartId);
      // Dispatch an event for other components to listen to and know a product was added
      window.dispatchEvent(
        new CustomEvent("alertDispatched", {
          detail: { header: "Book added to cart", body: productName },
        })
      );
    })
    .catch((error) => {
      console.error("Failed to add to cart:", error);
    });
}
