function clearCart() {
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
        detail: { header: "Failed to clear cart" },
      })
    );

    return;
  }

  const queryParams = new URLSearchParams({ cartId });

  fetch("/cart?" + queryParams.toString(), { method: "DELETE" })
    .then(async () => {
      localStorage.removeItem("cart");
      location.href = "/";
    })
    .catch((error) => {
      console.error("Failed to remove from cart:", error);
    });
}
