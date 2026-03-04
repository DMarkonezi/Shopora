window.onload = () => {
  initCommon();
  renderCart();
};

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartContent");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <a href="index.html" class="shop-btn">Start Shopping</a>
      </div>`;
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  container.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">
        ${cart.map(item => `
          <div class="cart-item">
            <div class="cart-item-img">📦</div>
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
            </div>
            <div class="cart-item-controls">
              <div class="qty-control">
                <button onclick="updateQty('${item.id}', -1)">−</button>
                <span>${item.quantity}</span>
                <button onclick="updateQty('${item.id}', 1)">+</button>
              </div>
              <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
              <button class="remove-btn" onclick="removeItem('${item.id}')" title="Remove">✕</button>
            </div>
          </div>`).join("")}
      </div>

      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Subtotal (${cart.reduce((s,i) => s + i.quantity, 0)} items)</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:var(--success)">Free</span>' : "$" + shipping.toFixed(2)}</span></div>
        ${shipping > 0 ? `<div style="font-size:0.75rem;color:var(--text-muted);margin-top:-6px">Free shipping on orders over $100</div>` : ""}
        <div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
        <button class="checkout-btn" onclick="goToCheckout()">Proceed to Checkout →</button>
        <button class="continue-btn" onclick="window.location.href='index.html'">← Continue Shopping</button>
      </div>
    </div>`;
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart.splice(cart.indexOf(item), 1);
  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
  showToast("Item removed from cart.");
}

function goToCheckout() {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please sign in to continue.");
    openLoginModal();
    return;
  }
  window.location.href = "checkout.html";
}

function openCart() { /* već smo tu */ }