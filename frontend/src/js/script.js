let allProducts = [], filteredProducts = [];
  let currentPage = 1;
  const PER_PAGE = 12;
  let selectedCategory = null;
  let currentUser = null;

  // window.onload = async () => {
  //   loadUser();
  //   await Promise.all([loadCategories(), loadProducts()]);
  //   //updateCartCount();
  // };

  document.addEventListener("DOMContentLoaded", async () => {
    loadUser();
    await Promise.all([loadCategories(), loadProducts()]);
  });

  // function loadUser() {
  //   const saved = localStorage.getItem("shopora_user");
  //   if (saved) { currentUser = JSON.parse(saved); updateNavForUser(); }
  // }

  // function updateNavForUser() {
  //   if (currentUser) {
  //     document.getElementById("loginBtn").style.display = "none";
  //     const btn = document.getElementById("profileBtn");
  //     btn.style.display = "flex";
  //     btn.textContent = (currentUser.firstName?.[0] || "U").toUpperCase();
  //   } else {
  //     document.getElementById("loginBtn").style.display = "block";
  //     document.getElementById("profileBtn").style.display = "none";
  //   }
  // }

  // function openLoginModal() {
  //   document.getElementById("loginModal").classList.add("open");
  //   document.getElementById("loginEmail").value = "";
  //   document.getElementById("loginError").style.display = "none";
  //   setTimeout(() => document.getElementById("loginEmail").focus(), 100);
  // }

  // function closeLoginModal() { document.getElementById("loginModal").classList.remove("open"); }

  // async function submitLogin() {
  //   const email = document.getElementById("loginEmail").value.trim();
  //   if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  //     showError("loginError", "Please enter a valid email address."); return;
  //   }
  //   try {
  //     const res = await fetch(`${BASE_URL}/users/email/${encodeURIComponent(email)}`);
  //     if (!res.ok) { showError("loginError", "No account found with that email."); return; }
  //     currentUser = await res.json();
  //     localStorage.setItem("shopora_user", JSON.stringify(currentUser));
  //     closeLoginModal();
  //     updateNavForUser();
  //     showToast(`Welcome back, ${currentUser.firstName || "there"}! 👋`, "success");
  //   } catch { showError("loginError", "Something went wrong. Try again."); }
  // }

  // function openProfileModal() {
  //   document.getElementById("profileAvatar").textContent = (currentUser.firstName?.[0] || "U").toUpperCase();
  //   document.getElementById("profileName").textContent = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
  //   document.getElementById("profileEmail").textContent = currentUser.email || "";
  //   document.getElementById("profileModal").classList.add("open");
  // }

  // function closeProfileModal() { document.getElementById("profileModal").classList.remove("open"); }

  // function logout() {
  //   currentUser = null;
  //   localStorage.removeItem("shopora_user");
  //   closeProfileModal();
  //   updateNavForUser();
  //   showToast("You've been signed out.");
  // }

  async function loadCategories() {
    try {
      const res = await fetch(`${BASE_URL}/categories`);
      if (!res.ok) return;
      const cats = await res.json();
      const list = document.getElementById("categoryList");
      cats.forEach(c => {
        const li = document.createElement("li");
        li.textContent = c.name;
        li.onclick = () => filterByCategory(c.name, li);
        list.appendChild(li);
      });
    } catch {}
  }

  function filterByCategory(name, el) {
    selectedCategory = name;
    document.querySelectorAll(".category-list li").forEach(li => li.classList.remove("active"));
    el.classList.add("active");
    currentPage = 1;
    applyFilters();
  }

  async function loadProducts() {
    try {
      const res = await fetch(`${BASE_URL}/products`);
      if (!res.ok) throw new Error();
      allProducts = await res.json();
      const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
      const sel = document.getElementById("brandFilter");
      brands.forEach(b => { const o = document.createElement("option"); o.value = b; o.textContent = b; sel.appendChild(o); });
      filteredProducts = [...allProducts];
      renderProducts();
    } catch {
      document.getElementById("productGrid").innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>Could not load products. Make sure the API is running.</p></div>`;
      document.getElementById("productCount").textContent = "";
    }
  }

  function applyFilters() {
    const brand = document.getElementById("brandFilter").value;
    const minP = parseFloat(document.getElementById("minPrice").value) || 0;
    const maxP = parseFloat(document.getElementById("maxPrice").value) || Infinity;
    const search = document.getElementById("searchInput").value.toLowerCase();
    const sort = document.getElementById("sortSelect").value;

    filteredProducts = allProducts.filter(p => {
      if (brand && p.brand !== brand) return false;
      if (p.price < minP || p.price > maxP) return false;
      if (selectedCategory && p.category?.name !== selectedCategory) return false;
      if (search && !p.name?.toLowerCase().includes(search) && !p.brand?.toLowerCase().includes(search)) return false;
      return true;
    });

    if (sort === "price-asc") filteredProducts.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") filteredProducts.sort((a, b) => b.price - a.price);
    else if (sort === "rating") filteredProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

    currentPage = 1;
    renderProducts();
  }

  function clearFilters() {
    document.getElementById("brandFilter").value = "";
    document.getElementById("minPrice").value = "";
    document.getElementById("maxPrice").value = "";
    document.getElementById("searchInput").value = "";
    selectedCategory = null;
    document.querySelectorAll(".category-list li").forEach((li, i) => li.classList.toggle("active", i === 0));
    filteredProducts = [...allProducts];
    currentPage = 1;
    renderProducts();
  }

  function renderProducts() {
    const grid = document.getElementById("productGrid");
    const total = filteredProducts.length;
    document.getElementById("productCount").textContent = `${total} product${total !== 1 ? "s" : ""} found`;

    if (total === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><p>No products match your filters.</p></div>`;
      document.getElementById("pagination").innerHTML = "";
      return;
    }

    const start = (currentPage - 1) * PER_PAGE;
    const page = filteredProducts.slice(start, start + PER_PAGE);

    grid.innerHTML = page.map(p => `
      <div class="product-card" onclick="goToProduct('${p.id}')">
        <div class="product-img-placeholder">📦</div>
        <div class="product-info">
          <div class="product-brand">${p.brand || "–"}</div>
          <div class="product-name">${p.name || "Unnamed Product"}</div>
          <div class="product-rating">
            <span class="stars">${stars(p.averageRating || 0)}</span>
            <span>${(p.averageRating || 0).toFixed(1)} (${p.reviewCount || 0})</span>
          </div>
          <div class="product-footer">
            <div>
              <div class="product-price">$${(p.price || 0).toFixed(2)}</div>
              ${p.stock <= 0 ? '<div class="out-of-stock">Out of stock</div>' : ''}
            </div>
            <button class="add-to-cart" onclick="addToCart(event,'${p.id}','${(p.name||'').replace(/'/g,"\\'")}',${p.price})" ${p.stock <= 0 ? "disabled" : ""}>+</button>
          </div>
        </div>
      </div>`).join("");

    renderPagination(total);
  }

  function stars(r) { const f = Math.round(r); return "★".repeat(f) + "☆".repeat(5 - f); }

  function renderPagination(total) {
    const pages = Math.ceil(total / PER_PAGE);
    const el = document.getElementById("pagination");
    if (pages <= 1) { el.innerHTML = ""; return; }
    let html = "";
    if (currentPage > 1) html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">‹</button>`;
    for (let i = 1; i <= pages; i++) html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">${i}</button>`;
    if (currentPage < pages) html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">›</button>`;
    el.innerHTML = html;
  }

  function goToPage(p) { currentPage = p; renderProducts(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function goToProduct(id) { window.location.href = `product.html?id=${id}`; }

  // function getCart() { return JSON.parse(localStorage.getItem("shopora_cart") || "[]"); }
  // function saveCart(cart) { localStorage.setItem("shopora_cart", JSON.stringify(cart)); updateCartCount(); }
  // function updateCartCount() { document.getElementById("cartCount").textContent = getCart().reduce((s, i) => s + i.quantity, 0); }

  function addToCart(e, id, name, price) {
    e.stopPropagation();
    const cart = getCart();
    const ex = cart.find(i => i.id === id);
    if (ex) ex.quantity++; else cart.push({ id, name, price, quantity: 1 });
    saveCart(cart);
    showToast(`${name} added to cart ✓`, "success");
  }

  //function openCart() { window.location.href = "cart.html"; }

  // function showToast(msg, type = "") {
  //   const t = document.getElementById("toast");
  //   t.textContent = msg; t.className = `toast ${type} show`;
  //   setTimeout(() => t.className = "toast", 2800);
  // }

  // function showError(id, msg) {
  //   const el = document.getElementById(id);
  //   el.textContent = msg; el.style.display = "block";
  // }

  // document.querySelectorAll(".modal-overlay").forEach(o => {
  //   o.addEventListener("click", e => { if (e.target === o) o.classList.remove("open"); });
  // });