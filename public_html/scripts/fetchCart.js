async function fetchCart(cartId) {
  await fetch(`/cart?cartId=${cartId}`, { method: "GET" })
    .then((response) => response.json())
    .then((cart) => {
      // Set the cart item in localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      // Dispatch an event for other components to listen to and know our cart has changed
      window.dispatchEvent(new Event("cartChange"));
    })
    .catch((error) => {
      console.error("Failed to retrieve cart:", error);
    });
}
