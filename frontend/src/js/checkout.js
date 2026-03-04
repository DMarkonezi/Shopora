let selectedPayment = "Cash";

window.onload = () => {
  initCommon();
  updateCartCount();
  renderPage();
};

function renderPage() {
  const user = getCurrentUser();
  const cart = getCart();

  if (!user) {
    document.getElementById("pageContent").innerHTML = `
      <div class="not-logged-in">
        <div class="icon">🔒</div>
        <h2>Sign in to continue</h2>
        <p>You need to be signed in to complete your purchase.</p>
        <button class="btn-primary" onclick="openLoginModal()">Sign In</button>
      </div>`;
    return;
  }

  if (cart.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  renderCheckout(user, cart);
}

function renderCheckout(user, cart) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  // prefill default address if exists
  const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0] || {};

  document.getElementById("pageContent").innerHTML = `
    <div class="checkout-page">
      <h1 class="page-title">Checkout</h1>
      <p class="page-subtitle">Complete your order</p>

      <div class="steps">
        <div class="step done"><div class="step-num">✓</div><span>Cart</span></div>
        <div class="step-divider done"></div>
        <div class="step active"><div class="step-num">2</div><span>Shipping</span></div>
        <div class="step-divider"></div>
        <div class="step"><div class="step-num">3</div><span>Payment</span></div>
        <div class="step-divider"></div>
        <div class="step"><div class="step-num">4</div><span>Confirm</span></div>
      </div>

      <div class="checkout-layout">
        <div>
          <!-- SHIPPING -->
          <div class="form-card">
            <h3>📦 Shipping Address</h3>
            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input type="text" id="firstName" value="${user.firstName || ""}" />
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" id="lastName" value="${user.lastName || ""}" />
              </div>
            </div>
            <div class="form-group">
              <label>Street Address</label>
              <input type="text" id="street" placeholder="123 Main St" value="${defaultAddr.street || ""}" />
            </div>
            <div class="form-row three">
              <div class="form-group">
                <label>City</label>
                <input type="text" id="city" placeholder="New York" value="${defaultAddr.city || ""}" />
              </div>
              <div class="form-group">
                <label>ZIP Code</label>
                <input type="text" id="zipCode" placeholder="10001" value="${defaultAddr.zipCode || ""}" />
              </div>
              <div class="form-group">
                <label>Country</label>
                <input type="text" id="country" placeholder="US" value="${defaultAddr.country || ""}" />
              </div>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" id="phone" placeholder="+1 234 567 8900" />
            </div>
          </div>

          <!-- PAYMENT -->
          <div class="form-card">
            <h3>💳 Payment Method</h3>
            <div class="payment-options">
              <label class="payment-option selected" onclick="selectPayment('Cash', this)">
                <input type="radio" name="payment" value="Cash" checked />
                <span class="payment-icon">💵</span>
                <div>
                  <div class="payment-option-label">Cash on Delivery</div>
                  <div class="payment-option-desc">Pay when your order arrives</div>
                </div>
              </label>
              <label class="payment-option" onclick="selectPayment('Card', this)">
                <input type="radio" name="payment" value="Card" />
                <span class="payment-icon">💳</span>
                <div>
                  <div class="payment-option-label">Credit / Debit Card</div>
                  <div class="payment-option-desc">Visa, Mastercard, Amex</div>
                </div>
              </label>
              <label class="payment-option" onclick="selectPayment('PayPal', this)">
                <input type="radio" name="payment" value="PayPal" />
                <span class="payment-icon">🅿️</span>
                <div>
                  <div class="payment-option-label">PayPal</div>
                  <div class="payment-option-desc">Fast and secure payment</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- SUMMARY -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="summary-items">
            ${cart.map(i => `
              <div class="summary-item">
                <span class="summary-item-name">${i.name}</span>
                <span class="summary-item-qty">x${i.quantity}</span>
                <span class="summary-item-price">$${(i.price * i.quantity).toFixed(2)}</span>
              </div>`).join("")}
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:var(--success)">Free</span>' : "$" + shipping.toFixed(2)}</span></div>
          <div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
          <button class="place-order-btn" id="placeOrderBtn" onclick="placeOrder()">
            Place Order · $${total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>`;
}

function selectPayment(method, el) {
  selectedPayment = method;
  document.querySelectorAll(".payment-option").forEach(o => o.classList.remove("selected"));
  el.classList.add("selected");
}

function validate() {
  const fields = ["street", "city", "zipCode", "country", "phone"];
  let valid = true;
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.classList.add("error"); valid = false; }
    else el.classList.remove("error");
  });
  if (!valid) showToast("Please fill in all required fields.");
  return valid;
}

async function placeOrder() {
  if (!validate()) return;

  const user = getCurrentUser();
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;
  btn.textContent = "Placing order...";

  const order = {
    userId: user.id,
    orderNumber: "ORD-" + Date.now(),
    items: cart.map(i => ({
      productId: i.id,
      productName: i.name,
      unitPriceAtPurchase: i.price,
      quantity: i.quantity
    })),
    totalAmount: subtotal + shipping,
    shippingAddress: {
      street: document.getElementById("street").value.trim(),
      city: document.getElementById("city").value.trim(),
      zipCode: document.getElementById("zipCode").value.trim(),
      country: document.getElementById("country").value.trim(),
      phoneNumber: document.getElementById("phone").value.trim()
    },
    paymentMethod: selectedPayment,
    status: 0 // Pending
  };

  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    if (!res.ok) throw new Error();
    const created = await res.json();

    // clear cart
    saveCart([]);

    showSuccess(created.orderNumber || order.orderNumber);
  } catch {
    showToast("Failed to place order. Please try again.");
    btn.disabled = false;
    btn.textContent = `Place Order · $${(subtotal + shipping).toFixed(2)}`;
  }
}

function showSuccess(orderNumber) {
  document.getElementById("pageContent").innerHTML = `
    <div class="success-screen">
      <div class="success-icon">🎉</div>
      <h2>Order Placed Successfully!</h2>
      <p>Thank you for your purchase. Your order has been received.</p>
      <div class="order-number">${orderNumber}</div>
      <p style="font-size:0.8rem">You will receive a confirmation shortly.</p>
      <div class="success-actions">
        <a href="orders.html" class="btn-primary">View My Orders</a>
        <a href="index.html" class="btn-secondary">Continue Shopping</a>
      </div>
    </div>`;
}

function openCart() { window.location.href = "cart.html"; }