let currentUserData = null;

window.onload = async () => {
  initCommon();
  updateCartCount();
  renderPage();
};

function renderPage() {
  const user = getCurrentUser();

  if (!user) {
    document.getElementById("pageContent").innerHTML = `
      <div class="profile-page">
        <div class="not-logged-in">
          <div class="icon">🔒</div>
          <h2>Sign in to view your profile</h2>
          <p>You need to be signed in to manage your account.</p>
          <button class="btn-primary" onclick="openLoginModal()">Sign In</button>
        </div>
      </div>`;
    return;
  }

  currentUserData = { ...user };
  renderProfile();
}

function renderProfile() {
  const u = currentUserData;
  const initials = (u.firstName?.[0] || "U").toUpperCase();

  document.getElementById("pageContent").innerHTML = `
    <div class="profile-page">
      <h1 class="page-title">My Profile</h1>
      <div class="profile-layout">

        <!-- SIDEBAR -->
        <div class="profile-sidebar">
          <div class="profile-avatar-big">${initials}</div>
          <div class="profile-sidebar-name">${u.firstName || ""} ${u.lastName || ""}</div>
          <div class="profile-sidebar-email">${u.email || ""}</div>
          <ul class="profile-sidebar-menu">
            <li><button class="active" onclick="switchTab('info', this)">👤 Personal Info</button></li>
            <li><button onclick="switchTab('addresses', this)">📍 Addresses</button></li>
          </ul>
        </div>

        <!-- CONTENT -->
        <div>
          <!-- PERSONAL INFO -->
          <div class="profile-section active" id="tab-info">
            <div class="section-card">
              <h3>Personal Information</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" id="editFirstName" value="${u.firstName || ""}" />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" id="editLastName" value="${u.lastName || ""}" />
                </div>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="editEmail" value="${u.email || ""}" disabled />
              </div>
              <div class="form-group">
                <label>Role</label>
                <input type="text" value="${u.role ?? "Customer"}" disabled />
              </div>
              <button class="save-btn" onclick="savePersonalInfo()">Save Changes</button>
            </div>
          </div>

          <!-- ADDRESSES -->
          <div class="profile-section" id="tab-addresses">
            <div class="section-card">
              <h3>My Addresses</h3>
              <div class="addresses-grid" id="addressesGrid"></div>
              <button class="add-address-btn" onclick="toggleAddressForm()">+ Add New Address</button>
              <div class="add-addr-form" id="addAddrForm">
                <h4>New Address</h4>
                <div class="form-group">
                  <label>Street</label>
                  <input type="text" id="addrStreet" placeholder="123 Main St" />
                </div>
                <div class="addr-form-row">
                  <div class="form-group">
                    <label>City</label>
                    <input type="text" id="addrCity" placeholder="New York" />
                  </div>
                  <div class="form-group">
                    <label>ZIP Code</label>
                    <input type="text" id="addrZip" placeholder="10001" />
                  </div>
                </div>
                <div class="addr-form-actions">
                  <button class="save-btn" onclick="saveAddress()">Add Address</button>
                  <button class="cancel-addr-btn" onclick="toggleAddressForm()">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>`;

  renderAddresses();
}

function switchTab(tab, el) {
  document.querySelectorAll(".profile-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".profile-sidebar-menu button").forEach(b => b.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");
  el.classList.add("active");
}

// PERSONAL INFO
async function savePersonalInfo() {
  const firstName = document.getElementById("editFirstName").value.trim();
  const lastName = document.getElementById("editLastName").value.trim();

  if (!firstName || !lastName) { showToast("Please fill in all fields."); return; }

  const updated = { ...currentUserData, firstName, lastName };

  try {
    const res = await fetch(`${BASE_URL}/users/${currentUserData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    if (!res.ok) throw new Error();
    currentUserData = updated;
    localStorage.setItem("shopora_user", JSON.stringify(updated));
    showToast("Profile updated successfully! ✓", "success");

    // update navbar initials
    const btn = document.getElementById("profileBtn");
    if (btn) btn.textContent = (firstName[0] || "U").toUpperCase();
    document.querySelector(".profile-avatar-big").textContent = (firstName[0] || "U").toUpperCase();
    document.querySelector(".profile-sidebar-name").textContent = `${firstName} ${lastName}`;
  } catch {
    showToast("Failed to update profile. Try again.");
  }
}

// ADDRESSES
function renderAddresses() {
  const grid = document.getElementById("addressesGrid");
  const addresses = currentUserData.addresses || [];

  if (addresses.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-muted);font-size:0.875rem">No addresses saved yet.</p>`;
    return;
  }

  grid.innerHTML = addresses.map((addr, i) => `
    <div class="address-card ${addr.isDefault ? "default" : ""}">
      <div class="address-info">
        ${addr.isDefault ? '<span class="default-badge">Default</span><br>' : ""}
        <p>
          ${addr.street || ""}<br>
          ${addr.city || ""}${addr.zipCode ? ", " + addr.zipCode : ""}
        </p>
      </div>
      <div class="address-actions">
        ${!addr.isDefault ? `<button class="addr-btn" onclick="setDefault(${i})">Set Default</button>` : ""}
        <button class="addr-btn danger" onclick="removeAddress(${i})">Remove</button>
      </div>
    </div>`).join("");
}

function toggleAddressForm() {
  document.getElementById("addAddrForm").classList.toggle("open");
  document.getElementById("addrStreet").value = "";
  document.getElementById("addrCity").value = "";
  document.getElementById("addrZip").value = "";
}

async function saveAddress() {
  const street = document.getElementById("addrStreet").value.trim();
  const city = document.getElementById("addrCity").value.trim();
  const zipCode = document.getElementById("addrZip").value.trim();

  if (!street || !city) { showToast("Please fill in street and city."); return; }

  const newAddress = { street, city, zipCode, isDefault: currentUserData.addresses?.length === 0 };

  try {
    const res = await fetch(`${BASE_URL}/users/${currentUserData.id}/address`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAddress)
    });

    if (!res.ok) throw new Error();

    currentUserData.addresses = [...(currentUserData.addresses || []), newAddress];
    localStorage.setItem("shopora_user", JSON.stringify(currentUserData));
    toggleAddressForm();
    renderAddresses();
    showToast("Address added! ✓", "success");
  } catch {
    showToast("Failed to add address. Try again.");
  }
}

async function removeAddress(index) {
  const addr = currentUserData.addresses[index];

  try {
    const res = await fetch(`${BASE_URL}/users/${currentUserData.id}/address`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addr.street)
    });

    if (!res.ok) throw new Error();

    currentUserData.addresses.splice(index, 1);
    localStorage.setItem("shopora_user", JSON.stringify(currentUserData));
    renderAddresses();
    showToast("Address removed.");
  } catch {
    showToast("Failed to remove address. Try again.");
  }
}

async function setDefault(index) {
  currentUserData.addresses = currentUserData.addresses.map((a, i) => ({
    ...a,
    isDefault: i === index
  }));

  try {
    const res = await fetch(`${BASE_URL}/users/${currentUserData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentUserData)
    });

    if (!res.ok) throw new Error();
    localStorage.setItem("shopora_user", JSON.stringify(currentUserData));
    renderAddresses();
    showToast("Default address updated! ✓", "success");
  } catch {
    showToast("Failed to update. Try again.");
  }
}

function openCart() { window.location.href = "cart.html"; }