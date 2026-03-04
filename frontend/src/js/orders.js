let allOrders = [];
let activeFilter = "all";

const STATUS_LABELS = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const STATUS_CLASSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const STATUS_ICONS = ["⏳", "✅", "🚚", "📬", "❌"];

window.onload = async () => {
  initCommon();
  updateCartCount();
  renderPage();
};

async function renderPage() {
  const user = getCurrentUser();

  if (!user) {
    document.getElementById("pageContent").innerHTML = `
      <div class="orders-page">
        <div class="not-logged-in">
          <div class="icon">🔒</div>
          <h2>Sign in to view your orders</h2>
          <p>You need to be signed in to see your order history.</p>
          <button class="btn-primary" onclick="openLoginModal()">Sign In</button>
        </div>
      </div>`;
    return;
  }

  document.getElementById("pageContent").innerHTML = `
    <div class="orders-page">
      <h1 class="page-title">My Orders</h1>
      <p class="page-subtitle">Track and manage your purchases</p>
      <div class="status-tabs" id="statusTabs">
        <button class="tab active" onclick="filterOrders('all', this)">All</button>
        <button class="tab" onclick="filterOrders('pending', this)">⏳ Pending</button>
        <button class="tab" onclick="filterOrders('confirmed', this)">✅ Confirmed</button>
        <button class="tab" onclick="filterOrders('shipped', this)">🚚 Shipped</button>
        <button class="tab" onclick="filterOrders('delivered', this)">📬 Delivered</button>
        <button class="tab" onclick="filterOrders('cancelled', this)">❌ Cancelled</button>
      </div>
      <div class="orders-list" id="ordersList">
        <div class="loading-state"><div class="spinner"></div><p>Loading orders...</p></div>
      </div>
    </div>`;

  await loadOrders(user.id);
}

async function loadOrders(userId) {
  try {
    const res = await fetch(`${BASE_URL}/orders/user/${userId}`);
    if (!res.ok) throw new Error();
    allOrders = await res.json();
    allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    renderOrders();
  } catch {
    document.getElementById("ordersList").innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <p>Could not load orders. Make sure the API is running.</p>
      </div>`;
  }
}

function filterOrders(status, el) {
  activeFilter = status;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  renderOrders();
}

function renderOrders() {
  const filtered = activeFilter === "all"
    ? allOrders
    : allOrders.filter(o => STATUS_CLASSES[o.status] === activeFilter);

  const container = document.getElementById("ordersList");

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📦</div>
        <h2>No orders found</h2>
        <p>${activeFilter === "all" ? "You haven't placed any orders yet." : `No ${activeFilter} orders.`}</p>
        <a href="index.html" style="display:inline-block;margin-top:8px;background:var(--primary);color:white;border:none;padding:12px 24px;border-radius:10px;font-weight:700;text-decoration:none;">Start Shopping</a>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(order => {
    const statusIdx = typeof order.status === "number" ? order.status : 0;
    const statusLabel = STATUS_LABELS[statusIdx] || "Pending";
    const statusClass = STATUS_CLASSES[statusIdx] || "pending";
    const statusIcon = STATUS_ICONS[statusIdx] || "⏳";
    const date = new Date(order.orderDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;

    return `
      <div class="order-card">
        <div class="order-header" onclick="toggleOrder('${order.id}')">
          <div class="order-header-left">
            <div class="order-number">${order.orderNumber || order.id}</div>
            <div class="order-date">${date} · ${itemCount} item${itemCount !== 1 ? "s" : ""}</div>
          </div>
          <div class="order-header-right">
            <span class="status-badge status-${statusClass}">${statusIcon} ${statusLabel}</span>
            <span class="order-total">$${(order.totalAmount || 0).toFixed(2)}</span>
            <span class="expand-icon" id="icon-${order.id}">▼</span>
          </div>
        </div>
        <div class="order-body" id="body-${order.id}">
          <div class="order-items">
            ${(order.items || []).map(item => `
              <div class="order-item">
                <div class="order-item-img">📦</div>
                <div class="order-item-info">
                  <div class="order-item-name">${item.productName || "Product"}</div>
                  <div class="order-item-meta">Qty: ${item.quantity} · $${(item.unitPriceAtPurchase || 0).toFixed(2)} each</div>
                </div>
                <div class="order-item-price">$${((item.unitPriceAtPurchase || 0) * item.quantity).toFixed(2)}</div>
              </div>`).join("")}
          </div>
          <div class="order-footer">
            <div class="order-detail-block">
              <h4>Shipping Address</h4>
              <p>
                ${order.shippingAddress ? `
                  ${order.shippingAddress.street || ""}<br>
                  ${order.shippingAddress.city || ""}, ${order.shippingAddress.zipCode || ""}<br>
                  ${order.shippingAddress.country || ""}
                ` : "No address provided"}
              </p>
            </div>
            <div class="order-detail-block">
              <h4>Payment</h4>
              <p>${order.paymentMethod ?? "–"}</p>
              <h4 style="margin-top:10px">Order Total</h4>
              <p style="font-size:1rem;font-weight:800;color:var(--primary)">$${(order.totalAmount || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");
}

function toggleOrder(id) {
  const body = document.getElementById(`body-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  body.classList.toggle("open");
  icon.classList.toggle("open");
}

function openCart() { window.location.href = "cart.html"; }