let product = null;
let reviews = [];
let selectedRating = 0;
let quantity = 1;

// window.onload = async () => {
//   initCommon();
//   const id = new URLSearchParams(window.location.search).get("id");
//   if (!id) { window.location.href = "index.html"; return; }
//   await Promise.all([loadProduct(id), loadReviews(id)]);
// };

document.addEventListener("DOMContentLoaded", async () => {
  initCommon();

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    window.location.href = "index.html";
    return;
  }

  await Promise.all([loadProduct(id), loadReviews(id)]);
});

async function loadProduct(id) {
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error();
    product = await res.json();
    renderProduct();
  } catch {
    document.getElementById("pageContent").innerHTML = `
      <div class="loading-page">
        <div style="font-size:3rem">⚠️</div>
        <p>Product not found. <a href="index.html" style="color:var(--primary)">Go back</a></p>
      </div>`;
  }
}

async function loadReviews(id) {
  try {
    const res = await fetch(`${BASE_URL}/reviews/product/${id}`);
    if (!res.ok) return;
    reviews = await res.json();
  } catch {}
}

function renderProduct() {
  const stockBadge = product.stock > 10
    ? `<span class="stock-badge in-stock">✓ In Stock</span>`
    : product.stock > 0
    ? `<span class="stock-badge low-stock">⚠ Only ${product.stock} left</span>`
    : `<span class="stock-badge out-stock">✗ Out of Stock</span>`;

  const specsRows = (product.specifications || []).map(s =>
    `<tr><td>${s.key}</td><td>${s.value}${s.unit ? " " + s.unit : ""}</td></tr>`
  ).join("") || `<tr><td colspan="2" style="color:var(--text-muted);text-align:center;padding:16px">No specifications available</td></tr>`;

  document.getElementById("pageContent").innerHTML = `
    <div class="product-page">
      <div class="breadcrumb">
        <a href="index.html">Shop</a> ›
        <span>${product.category?.name || "Products"}</span> ›
        <span>${product.name}</span>
      </div>

      <div class="product-top">
        <div class="product-gallery">📦</div>

        <div class="product-details">
          <div class="product-badge">🏷 ${product.category?.name || "Product"}</div>
          <h1 class="product-title">${product.name}</h1>
          <div class="product-brand-line">Brand: <span>${product.brand || "–"}</span> · SKU: <span>${product.sku || "–"}</span></div>

          <div class="rating-row">
            <span class="rating-stars">${stars(product.averageRating || 0)}</span>
            <span class="rating-text"><strong>${(product.averageRating || 0).toFixed(1)}</strong> / 5 · ${product.reviewCount || 0} review${product.reviewCount !== 1 ? "s" : ""}</span>
          </div>

          <div class="price-block">
            <div class="price-main">$${(product.price || 0).toFixed(2)}</div>
            ${stockBadge}
          </div>

          ${product.description ? `<p class="product-description">${product.description}</p>` : ""}

          <div class="qty-row">
            <span class="qty-label">Quantity</span>
            <div class="qty-control">
              <button onclick="changeQty(-1)">−</button>
              <span id="qtyDisplay">1</span>
              <button onclick="changeQty(1)">+</button>
            </div>
            <button class="add-btn" onclick="addToCartFromPage()" ${product.stock <= 0 ? "disabled" : ""}>
              🛒 Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div class="product-bottom">
        <div class="section-card">
          <h3>Specifications</h3>
          <table class="specs-table"><tbody>${specsRows}</tbody></table>
        </div>

        <div class="section-card reviews-section">
          <h3>Customer Reviews</h3>
          ${renderRatingSummary()}
          <div class="review-list" id="reviewList">${renderReviewList()}</div>
          <div class="add-review">${renderReviewForm()}</div>
        </div>
      </div>
    </div>`;
}

function renderRatingSummary() {
  if (reviews.length === 0) return "";
  const counts = [5,4,3,2,1].map(n => reviews.filter(r => r.rating === n).length);
  const bars = [5,4,3,2,1].map((n, i) => {
    const pct = reviews.length ? Math.round((counts[i] / reviews.length) * 100) : 0;
    return `<div class="rating-bar-row">
      <span>${n}★</span>
      <div class="rating-bar"><div class="rating-bar-fill" style="width:${pct}%"></div></div>
      <span>${counts[i]}</span>
    </div>`;
  }).join("");

  return `<div class="rating-summary">
    <div class="rating-big">
      <div class="number">${(product.averageRating || 0).toFixed(1)}</div>
      <div class="out-of">out of 5</div>
      <div class="stars">${stars(product.averageRating || 0)}</div>
    </div>
    <div class="rating-bars">${bars}</div>
  </div>`;
}

function renderReviewList() {
  if (reviews.length === 0) return `<div class="no-reviews">No reviews yet. Be the first to review!</div>`;
  return reviews.map(r => `
    <div class="review-item">
      <div class="review-header">
        <span class="reviewer-name">${r.userName || "Anonymous"}</span>
        <span class="review-date">${new Date(r.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="review-stars">${stars(r.rating)}</div>
      ${r.comment ? `<div class="review-comment">${r.comment}</div>` : ""}
    </div>`).join("");
}

function renderReviewForm() {
  const user = getCurrentUser(); // iz common.js
  if (!user) return `
    <div class="login-to-review">
      Want to leave a review? <a onclick="openLoginModal()">Sign in</a>
    </div>`;

  return `
    <h4>Write a Review</h4>
    <div class="star-picker" id="starPicker">
      ${[1,2,3,4,5].map(n => `<span onclick="setRating(${n})" data-val="${n}">★</span>`).join("")}
    </div>
    <textarea class="review-textarea" id="reviewComment" placeholder="Share your experience with this product..."></textarea>
    <button class="submit-review-btn" onclick="submitReview()">Submit Review</button>`;
}

function setRating(val) {
  selectedRating = val;
  document.querySelectorAll(".star-picker span").forEach(s => {
    s.classList.toggle("active", parseInt(s.dataset.val) <= val);
  });
}

async function submitReview() {
  const user = getCurrentUser();
  if (!user) { openLoginModal(); return; }
  if (selectedRating === 0) { showToast("Please select a rating."); return; }

  const comment = document.getElementById("reviewComment").value.trim();

  try {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        userId: user.id,
        userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        rating: selectedRating,
        comment
      })
    });

    if (!res.ok) throw new Error();
    const newReview = await res.json();
    reviews.unshift(newReview);

    // update local product rating
    product.reviewCount = (product.reviewCount || 0) + 1;
    product.averageRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    document.getElementById("reviewList").innerHTML = renderReviewList();
    selectedRating = 0;
    document.getElementById("reviewComment").value = "";
    document.querySelectorAll(".star-picker span").forEach(s => s.classList.remove("active"));
    showToast("Review submitted! ✓", "success");
  } catch {
    showToast("Failed to submit review. Try again.");
  }
}

function changeQty(delta) {
  quantity = Math.max(1, Math.min(product.stock, quantity + delta));
  document.getElementById("qtyDisplay").textContent = quantity;
}

function addToCartFromPage() {
  if (!product || product.stock <= 0) return;
  const cart = getCart();
  const ex = cart.find(i => i.id === product.id);
  if (ex) ex.quantity += quantity;
  else cart.push({ id: product.id, name: product.name, price: product.price, quantity });
  saveCart(cart);
  showToast(`${product.name} added to cart ✓`, "success");
}

function stars(r) { const f = Math.round(r); return "★".repeat(f) + "☆".repeat(5 - f); }