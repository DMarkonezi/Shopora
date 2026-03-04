const BASE_URL = "http://localhost:5100/api";

// ── INIT ──
function initCommon() {
  loadUser();
  updateCartCount();
  setupModalOverlays();
}

// ── AUTH ──
function getCurrentUser() {
  const saved = localStorage.getItem("shopora_user");
  return saved ? JSON.parse(saved) : null;
}

function loadUser() {
  const user = getCurrentUser();
  if (user) updateNavForUser(user);
}

function updateNavForUser(user) {
  const loginBtn = document.getElementById("loginBtn");
  const profileBtn = document.getElementById("profileBtn");
  if (!loginBtn || !profileBtn) return;

  if (user) {
    loginBtn.style.display = "none";
    profileBtn.style.display = "flex";
    profileBtn.textContent = (user.firstName?.[0] || "U").toUpperCase();
  } else {
    loginBtn.style.display = "block";
    profileBtn.style.display = "none";
  }
}

function openLoginModal() {
  document.getElementById("loginModal").classList.add("open");
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginError").style.display = "none";
  setTimeout(() => document.getElementById("loginEmail").focus(), 100);
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.remove("open");
}

async function submitLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("loginError", "Please enter a valid email address.");
    return;
  }

  if (!password) {
    showError("loginError", "Please enter your password.");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json();
      showError("loginError", err.message || "Invalid email or password.");
      return;
    }

    const user = await res.json();
    localStorage.setItem("shopora_user", JSON.stringify(user));
    closeLoginModal();
    updateNavForUser(user);
    showToast(`Welcome back, ${user.firstName || "there"}! 👋`, "success");

    setTimeout(() => window.location.reload(), 800);
  } catch {
    showError("loginError", "Something went wrong. Try again.");
  }
}

function openProfileModal() {
  const user = getCurrentUser();
  if (!user) return;
  document.getElementById("profileAvatar").textContent = (user.firstName?.[0] || "U").toUpperCase();
  document.getElementById("profileName").textContent = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  document.getElementById("profileEmail").textContent = user.email || "";
  document.getElementById("profileModal").classList.add("open");
}

function closeProfileModal() {
  document.getElementById("profileModal").classList.remove("open");
}

function logout() {
  localStorage.removeItem("shopora_user");
  closeProfileModal();
  updateNavForUser(null);
  showToast("You've been signed out.");
  setTimeout(() => window.location.href = "index.html", 800);
}

// ── CART ──
function getCart() {
  return JSON.parse(localStorage.getItem("shopora_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("shopora_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById("cartCount");
  if (!el) return;
  const total = getCart().reduce((s, i) => s + i.quantity, 0);
  el.textContent = total;
}

function openCart() {
  window.location.href = "cart.html";
}

// ── TOAST ──
function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.className = "toast", 2800);
}

// ── UTILS ──
function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function setupModalOverlays() {
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
}

async function submitRegister() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!firstName || !lastName || !email || !password) {
    showError("registerError", "All fields are required.");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password })
    });

    if (!res.ok) {
      const err = await res.text();
      showError("registerError", err);
      return;
    }

    const user = await res.json();
    localStorage.setItem("shopora_user", JSON.stringify(user));
    updateNavForUser(user);
    showToast("Registered successfully! 🎉", "success");
    setTimeout(() => window.location.href = "index.html", 800);
  } catch {
    showError("registerError", "Something went wrong, try again.");
  }
}