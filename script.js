// DATA KATALOG PRODUK ALAT TULIS
const products = [
  {
    id: 1,
    name: "Buku Catatan Grid A5 Hardcover",
    category: "Buku & Kertas",
    price: 45000,
    icon: "📓",
    desc: "Kertas 100gsm anti tembus tinta, isi 160 halaman kotak-kotak (grid)."
  },
  {
    id: 2,
    name: "Set Pulpen Gel Hitam 0.5mm (Isi 6)",
    category: "Pulpen & Pensil",
    price: 32000,
    icon: "🖊️",
    desc: "Tinta cepat kering, nyaman digenggam, cocok untuk catatan harian."
  },
  {
    id: 3,
    name: "Stabilo Pastel Highlighter (Set 6 Warna)",
    category: "Penanda & Warna",
    price: 54000,
    icon: "🖍️",
    desc: "Warna lembut tidak menyilaukan mata, ujung chisel tip presisi."
  },
  {
    id: 4,
    name: "Pensil Mekanik Metal 0.5mm + Isi",
    category: "Pulpen & Pensil",
    price: 28000,
    icon: "✏️",
    desc: "Bodi kokoh dengan grip anti slip, termasuk 1 tabung isi pensil 2B."
  },
  {
    id: 5,
    name: "Sticky Notes Transparan & Pastel",
    category: "Buku & Kertas",
    price: 18000,
    icon: "🗒️",
    desc: "Tahan air, mudah ditempel ulang tanpa meninggalkan bekas lem."
  },
  {
    id: 6,
    name: "Desk Organizer Kayu Minimalis",
    category: "Aksesoris Meja",
    price: 85000,
    icon: "🗂️",
    desc: "Tempat penyimpanan pulpen, gunting, dan kartu nama agar meja rapi."
  },
  {
    id: 7,
    name: "Brush Pen Kaligrafi (12 Warna)",
    category: "Penanda & Warna",
    price: 68000,
    icon: "🖌️",
    desc: "Ujung kuas fleksibel untuk lettering, ilustrasi, dan jurnal kreatif."
  },
  {
    id: 8,
    name: "Stapler Mini + 1000 Isi Staples",
    category: "Aksesoris Meja",
    price: 24000,
    icon: "📎",
    desc: "Ukuran ringkas masuk tempat pensil, mampu menjilid hingga 20 lembar."
  }
];

// STATE APLIKASI (Tersimpan di LocalStorage)
let cart = JSON.parse(localStorage.getItem("kp_cart")) || [];
let currentUser = JSON.parse(localStorage.getItem("kp_user")) || null;
let orders = JSON.parse(localStorage.getItem("kp_orders")) || [];

let selectedCategory = "Semua";
let searchQuery = "";
let sortBy = "default";
let authMode = "login";

// FORMAT RUPIAH
const formatRupiah = (angka) => {
  return "Rp" + angka.toLocaleString("id-ID");
};

// NOTIFIKASI TOAST
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

// RENDER KATALOG PRODUK
function renderProducts() {
  const grid = document.getElementById("productGrid");
  let filtered = products.filter((p) => {
    const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#64748b; padding:40px 0;">Produk tidak ditemukan. Coba kata kunci lain.</p>`;
    return;
  }

  grid.innerHTML = filtered.map((product) => `
    <div class="product-card">
      <div class="product-thumb">
        <span class="product-cat-badge">${product.category}</span>
        <span>${product.icon}</span>
      </div>
      <div class="product-body">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-desc">${product.desc}</p>
        <div class="product-footer">
          <span class="product-price">${formatRupiah(product.price)}</span>
          <button class="btn btn-primary" onclick="addToCart(${product.id})">+ Beli</button>
        </div>
      </div>
    </div>
  `).join("");
}

// LOGIKA KERANJANG BELANJA
function saveCart() {
  localStorage.setItem("kp_cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  showToast(`"${product.name}" ditambahkan ke keranjang!`);
}

function updateQty(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  }
  saveCart();
}

function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 150000 ? 0 : 15000;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function renderCart() {
  const cartItemsEl = document.getElementById("cartItems");
  const cartBadge = document.getElementById("cartBadge");
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartBadge.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p style="text-align:center; color:#64748b; margin-top:40px;">Keranjang belanja masih kosong.</p>`;
    document.getElementById("cartFooter").classList.add("hidden");
    return;
  }

  document.getElementById("cartFooter").classList.remove("hidden");

  cartItemsEl.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-icon">${item.icon}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span>${formatRupiah(item.price)}</span>
      </div>
      <div class="qty-controls">
        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
        <strong>${item.qty}</strong>
        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join("");

  const { subtotal, shipping, total } = calculateTotals();
  document.getElementById("subtotalText").textContent = formatRupiah(subtotal);
  document.getElementById("shippingText").textContent = shipping === 0 ? "GRATIS" : formatRupiah(shipping);
  document.getElementById("totalText").textContent = formatRupiah(total);
}

// LOGIKA LOGIN & USER
function renderUserSection() {
  const userSection = document.getElementById("userSection");
  if (currentUser) {
    userSection.innerHTML = `
      <div class="user-menu">
        <button class="btn btn-outline" onclick="openOrdersModal()">🧾 Pesanan (${orders.length})</button>
        <button class="btn btn-outline" onclick="logoutUser()">Keluar (${currentUser.name.split(" ")[0]})</button>
      </div>
    `;
  } else {
    userSection.innerHTML = `
      <button class="btn btn-outline" onclick="openModal('authModal')">Masuk / Daftar</button>
    `;
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem("kp_user");
  renderUserSection();
  showToast("Berhasil keluar dari akun.");
}

// KONTROL MODAL & DRAWER
const overlay = document.getElementById("overlay");

function openModal(modalId) {
  closeAllModals();
  overlay.classList.add("active");
  document.getElementById(modalId).classList.add("active");
}

function closeAllModals() {
  overlay.classList.remove("active");
  document.querySelectorAll(".modal, .cart-drawer").forEach((el) => el.classList.remove("active"));
}

function openOrdersModal() {
  const ordersList = document.getElementById("ordersList");
  if (orders.length === 0) {
    ordersList.innerHTML = `<p style="text-align:center; color:#64748b; padding:24px 0;">Belum ada riwayat pesanan.</p>`;
  } else {
    ordersList.innerHTML = orders.map((ord) => `
      <div class="order-card">
        <div class="order-top">
          <span><strong>#${ord.id}</strong> • ${ord.date}</span>
          <span class="status-badge">Diproses</span>
        </div>
        <p style="font-size:0.88rem; margin-bottom:6px;">${ord.itemsSummary}</p>
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#64748b;">
          <span>${ord.payment}</span>
          <strong style="color:#4f46e5;">${formatRupiah(ord.total)}</strong>
        </div>
      </div>
    `).join("");
  }
  openModal("ordersModal");
}

// EVENT LISTENERS
document.getElementById("openCartBtn").addEventListener("click", () => openModal("cartDrawer"));
document.getElementById("closeCartBtn").addEventListener("click", closeAllModals);
document.getElementById("closeAuthBtn").addEventListener("click", closeAllModals);
document.getElementById("closeCheckoutBtn").addEventListener("click", closeAllModals);
document.getElementById("closeOrdersBtn").addEventListener("click", closeAllModals);
overlay.addEventListener("click", closeAllModals);

// Filter Kategori
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    selectedCategory = tab.dataset.category;
    renderProducts();
  });
});

// Pencarian & Urutkan
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderProducts();
});

document.getElementById("sortSelect").addEventListener("change", (e) => {
  sortBy = e.target.value;
  renderProducts();
});

// Tab Login vs Daftar
document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    authMode = tab.dataset.mode;

    const nameGroup = document.getElementById("nameGroup");
    const authTitle = document.getElementById("authTitle");
    const authSubmitBtn = document.getElementById("authSubmitBtn");

    if (authMode === "register") {
      nameGroup.classList.remove("hidden");
      authTitle.textContent = "Daftar Akun Baru";
      authSubmitBtn.textContent = "Daftar Sekarang";
    } else {
      nameGroup.classList.add("hidden");
      authTitle.textContent = "Masuk ke Akun";
      authSubmitBtn.textContent = "Masuk Sekarang";
    }
  });
});

// Submit Form Login / Register
document.getElementById("authForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const nameInput = document.getElementById("authName").value.trim();
  const displayName = authMode === "register" && nameInput ? nameInput : email.split("@")[0];

  currentUser = { name: displayName, email };
  localStorage.setItem("kp_user", JSON.stringify(currentUser));
  renderUserSection();
  closeAllModals();
  showToast(`Selamat datang, ${currentUser.name}!`);
});

// Login Instan Demo
document.getElementById("demoLoginBtn").addEventListener("click", () => {
  currentUser = { name: "Nadia Putri", email: "nadia.demo@kertaspena.id" };
  localStorage.setItem("kp_user", JSON.stringify(currentUser));
  renderUserSection();
  closeAllModals();
  showToast("Berhasil masuk sebagai Nadia Putri (Demo)!");
});

// Tombol Lanjut Checkout
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!currentUser) {
    showToast("Silakan masuk ke akun terlebih dahulu untuk checkout.");
    openModal("authModal");
    return;
  }
  const { total } = calculateTotals();
  document.getElementById("shipName").value = currentUser.name;
  document.getElementById("checkoutFinalTotal").textContent = formatRupiah(total);
  openModal("checkoutModal");
});

// Proses Buat Pesanan
document.getElementById("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const { total } = calculateTotals();
  const payment = document.getElementById("paymentMethod").value;
  const itemsSummary = cart.map((i) => `${i.name} (${i.qty}x)`).join(", ");

  const newOrder = {
    id: "KP-" + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    itemsSummary,
    payment,
    total
  };

  orders.unshift(newOrder);
  localStorage.setItem("kp_orders", JSON.stringify(orders));

  cart = [];
  saveCart();
  renderUserSection();
  closeAllModals();
  showToast(`🎉 Pesanan ${newOrder.id} berhasil dibuat!`);
});

// INISIALISASI AWAL
renderProducts();
renderCart();
renderUserSection();
