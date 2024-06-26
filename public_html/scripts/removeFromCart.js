function removeFromCart(productId, productName) {
  let cartId;

  try {
    const cart = localStorage.getItem("cart");
    if (cart) {
      const { checkout } = JSON.parse(cart);
      cartId = checkout;
    }
  } catch {
    console.warn("Failed to retrieve any existing cart.");

    window.dispatchEvent(
      new CustomEvent("alertDispatched", {
        detail: {
          header: "Failed to add to cart",
          body: `Failed to remove ${productName}, please try again.`,
        },
      })
    );
    return;
  }

  const queryParams = new URLSearchParams({
    productId,
    cartId,
  });

  fetch("/cart?" + queryParams.toString(), { method: "DELETE" })
    .then(async () => {
      await fetchCart(cartId);
      location.reload();
    })
    .catch((error) => {
      console.error("Failed to remove from cart:", error);
    });
}
