/* ===== STATE ===== */
const state = {
  currentPage: 'home',
  products: [],
  cart: JSON.parse(localStorage.getItem('roselle_cart') || '[]'),
  orders: [],
  selectedProduct: null,
  selectedOrder: null,
  selectedQty: 1,
  currentFilter: 'الكل',
  deferredInstallPrompt: null,
  swRegistration: null,
  customer: JSON.parse(localStorage.getItem('roselle_customer') || 'null')
};

/* ===== DOM HELPERS ===== */
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const qsa = sel => document.querySelectorAll(sel);

/* ===== HAPTIC ===== */
function haptic(pattern = [10]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

/* ===== TOAST ===== */
let toastTimer;
function showToast(msg, type = '') {
  const toast = $('toast');
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ===== NAVIGATION ===== */
function navigate(page) {
  haptic([6]);
  state.currentPage = page;
  qsa('.page').forEach(p => p.classList.remove('active'));
  qsa('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = $(`page-${page}`);
  if (pageEl) pageEl.classList.add('active');
  const navEl = qs(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');

  // Load page data
  if (page === 'home') renderHome();
  if (page === 'products') renderProducts();
  if (page === 'orders') renderOrders();
  if (page === 'account') renderAccount();
  if (page === 'cart') renderCart();

  // Update URL
  const url = page === 'home' ? '/' : `/?page=${page}`;
  history.replaceState({ page }, '', url);
}

/* ===== CART ===== */
function saveCart() {
  localStorage.setItem('roselle_cart', JSON.stringify(state.cart));
  updateCartBadge();
}

function updateCartBadge() {
  const count = state.cart.reduce((s, i) => s + i.qty, 0);
  const badge = $('cart-badge');
  const navBadge = $('cart-nav-badge');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }
  if (navBadge) {
    navBadge.textContent = count;
    navBadge.classList.toggle('visible', count > 0);
  }
}

function addToCart(product, qty = 1) {
  haptic([10, 30, 10]);
  const existing = state.cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name_ar,
      price: product.price,
      image_url: product.image_url,
      qty
    });
  }
  saveCart();
  showToast('✓ تمت الإضافة للسلة', 'success');
}

function removeFromCart(id) {
  haptic([10]);
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function updateQty(id, delta) {
  haptic([6]);
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) {
    state.cart = state.cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
}

function getCartTotal() {
  return state.cart.reduce((s, i) => s + i.price * i.qty, 0);
}

/* ===== RENDER HOME ===== */
async function renderHome() {
  const container = $('page-home');
  if (!container) return;

  // Install banner
  const installBanner = $('install-banner');
  if (state.deferredInstallPrompt && installBanner) {
    installBanner.classList.add('visible');
  }

  // Load featured products
  if (state.products.length === 0) await loadProducts();

  const featured = state.products.slice(0, 4);
  const grid = $('home-products-grid');
  if (grid) {
    grid.innerHTML = featured.map(renderProductCard).join('');
    grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const p = state.products.find(x => x.id === id);
        if (p) addToCart(p);
        btn.classList.add('added');
        btn.innerHTML = '✓ تمت الإضافة';
        setTimeout(() => {
          btn.classList.remove('added');
          btn.innerHTML = '🛒 أضف للسلة';
        }, 1500);
      });
    });
    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) return;
        const id = card.dataset.id;
        openProductDetail(id);
      });
    });
  }

  // Stats
  renderHomeStats();
}

async function renderHomeStats() {
  try {
    const ordersCount = state.orders.length || (await db.query('orders', { limit: 1000 })).length;
    const productsCount = state.products.length;
    const statsEl = $('home-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon">🌸</div>
          <div class="stat-value">${productsCount}</div>
          <div class="stat-label">منتج متاح</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-value">${ordersCount}</div>
          <div class="stat-label">طلب مكتمل</div>
        </div>
      `;
    }
  } catch {}
}

/* ===== RENDER PRODUCT CARD ===== */
function renderProductCard(p) {
  const imgHtml = p.image_url
    ? `<img class="product-img" src="${p.image_url}" alt="${p.name_ar}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  return `
    <div class="product-card" data-id="${p.id}">
      ${imgHtml}
      <div class="product-img-placeholder" style="${p.image_url ? 'display:none' : ''}">🌸</div>
      <div class="product-info">
        <div class="product-name">${p.name_ar}</div>
        <div class="product-price">${parseFloat(p.price).toFixed(0)} <span class="currency">ر.س</span></div>
        <button class="add-to-cart-btn ripple" data-id="${p.id}">🛒 أضف للسلة</button>
      </div>
    </div>`;
}

/* ===== LOAD & RENDER PRODUCTS ===== */
async function loadProducts() {
  try {
    state.products = await db.query('products', { order: 'created_at.asc' });
  } catch (e) {
    console.error('Error loading products:', e);
    state.products = [];
  }
}

async function renderProducts() {
  const container = $('page-products');
  if (!container) return;

  const grid = $('products-grid');
  if (!grid) return;

  if (state.products.length === 0) {
    grid.innerHTML = '<div class="loading"><div class="spinner"></div><p>جارٍ تحميل المنتجات...</p></div>';
    await loadProducts();
  }

  renderProductsGrid();

  // Category chips
  const cats = ['الكل', ...new Set(state.products.map(p => p.category).filter(Boolean))];
  const catsEl = $('category-chips');
  if (catsEl) {
    catsEl.innerHTML = cats.map(c =>
      `<button class="cat-chip ${c === state.currentFilter ? 'active' : ''}" data-cat="${c}">${c}</button>`
    ).join('');
    catsEl.querySelectorAll('.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        haptic([6]);
        state.currentFilter = chip.dataset.cat;
        catsEl.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderProductsGrid();
      });
    });
  }
}

function renderProductsGrid() {
  const grid = $('products-grid');
  if (!grid) return;
  const filtered = state.currentFilter === 'الكل'
    ? state.products
    : state.products.filter(p => p.category === state.currentFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="loading"><p>لا توجد منتجات في هذه الفئة</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(renderProductCard).join('');
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const p = state.products.find(x => x.id === id);
      if (p) addToCart(p);
      btn.classList.add('added');
      btn.innerHTML = '✓ تمت الإضافة';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = '🛒 أضف للسلة';
      }, 1500);
    });
  });
  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.add-to-cart-btn')) return;
      openProductDetail(card.dataset.id);
    });
  });
}

/* ===== PRODUCT DETAIL ===== */
function openProductDetail(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  state.selectedProduct = p;
  state.selectedQty = 1;
  haptic([6]);

  const imgHtml = p.image_url
    ? `<img class="product-detail-img" src="${p.image_url}" alt="${p.name_ar}">`
    : `<div class="product-detail-img-placeholder">🌸</div>`;

  $('product-detail-content').innerHTML = `
    ${imgHtml}
    <div class="product-detail-name">${p.name_ar}</div>
    <div class="product-detail-price">${parseFloat(p.price).toFixed(2)} <small>ر.س</small></div>
    <div class="product-detail-meta">
      <span class="meta-chip">📂 ${p.category || 'باقات'}</span>
      <span class="meta-chip">📦 ${p.stock} متبقي</span>
    </div>
    <div class="product-detail-desc">${p.description_ar || p.description || 'زهور طازجة وجميلة من متجر روزيل.'}</div>
    <div class="qty-selector">
      <button class="qty-btn" id="detail-qty-minus">−</button>
      <span class="qty-num" id="detail-qty">1</span>
      <button class="qty-btn" id="detail-qty-plus">+</button>
    </div>
    <button class="btn-primary ripple" id="detail-add-btn">🛒 أضف للسلة</button>
  `;

  $('detail-qty-minus').addEventListener('click', () => {
    if (state.selectedQty > 1) {
      state.selectedQty--;
      $('detail-qty').textContent = state.selectedQty;
      haptic([6]);
    }
  });
  $('detail-qty-plus').addEventListener('click', () => {
    state.selectedQty++;
    $('detail-qty').textContent = state.selectedQty;
    haptic([6]);
  });
  $('detail-add-btn').addEventListener('click', () => {
    addToCart(p, state.selectedQty);
    closeSheet('product-detail-sheet');
  });

  openSheet('product-detail-sheet');
}

/* ===== RENDER CART ===== */
function renderCart() {
  const cartItems = $('cart-items');
  const cartEmpty = $('cart-empty');
  const cartSummary = $('cart-summary');
  const checkoutSection = $('checkout-section');

  if (state.cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = 'flex';
    if (cartItems) cartItems.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'none';
    if (checkoutSection) checkoutSection.style.display = 'none';
    return;
  }

  if (cartEmpty) cartEmpty.style.display = 'none';
  if (cartItems) cartItems.style.display = 'block';
  if (cartSummary) cartSummary.style.display = 'block';
  if (checkoutSection) checkoutSection.style.display = 'block';

  if (cartItems) {
    cartItems.innerHTML = state.cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}">` : '🌸'}
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${(item.price * item.qty).toFixed(2)} ر.س</div>
          <div class="cart-qty">
            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">🗑️</button>
      </div>
    `).join('');
  }

  const delivery = 15;
  const subtotal = getCartTotal();
  const total = subtotal + delivery;

  if (cartSummary) {
    cartSummary.querySelector('#cart-subtotal').textContent = subtotal.toFixed(2) + ' ر.س';
    cartSummary.querySelector('#cart-delivery').textContent = delivery.toFixed(2) + ' ر.س';
    cartSummary.querySelector('#cart-total').textContent = total.toFixed(2) + ' ر.س';
  }
}

/* ===== CHECKOUT ===== */
async function placeOrder() {
  haptic([10]);
  const name = $('customer-name').value.trim();
  const phone = $('customer-phone').value.trim();
  const address = $('customer-address').value.trim();
  const notes = $('order-notes').value.trim();

  if (!name || !phone || !address) {
    showToast('⚠️ يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }

  const btn = $('place-order-btn');
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px"></div> جارٍ تأكيد الطلب...';

  try {
    // Save or find customer
    let customerId;
    const existing = state.customer;
    if (existing && existing.name === name) {
      customerId = existing.id;
    } else {
      const [cust] = await db.insert('customers', { name, phone, address });
      customerId = cust.id;
      state.customer = cust;
      localStorage.setItem('roselle_customer', JSON.stringify(cust));
    }

    // Create order
    const delivery = 15;
    const total = getCartTotal() + delivery;
    const [order] = await db.insert('orders', {
      customer_id: customerId,
      total_amount: total,
      notes,
      delivery_address: address,
      status: 'قيد الانتظار'
    });

    // Create order items
    for (const item of state.cart) {
      await db.insert('order_items', {
        order_id: order.id,
        product_id: item.id,
        quantity: item.qty,
        unit_price: item.price
      });
    }

    // Clear cart
    state.cart = [];
    saveCart();
    renderCart();

    showToast('🎉 تم تأكيد طلبك بنجاح!', 'success');
    haptic([50, 100, 50]);

    // Go to orders
    setTimeout(() => navigate('orders'), 1500);
  } catch (e) {
    console.error('Order error:', e);
    showToast('❌ حدث خطأ، يرجى المحاولة مجدداً', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '✅ تأكيد الطلب';
  }
}

/* ===== RENDER ORDERS ===== */
async function renderOrders() {
  const container = $('orders-container');
  if (!container) return;

  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>جارٍ تحميل الطلبات...</p></div>';

  try {
    // Get customer orders if we have a customer
    let orders;
    if (state.customer) {
      orders = await db.query('orders', {
        select: '*',
        filter: { customer_id: `eq.${state.customer.id}` },
        order: 'created_at.desc'
      });
    } else {
      orders = [];
    }
    state.orders = orders;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="orders-empty">
          <div class="orders-empty-icon">📦</div>
          <h3>لا توجد طلبات بعد</h3>
          <p>ابدئي بتسوقك من عالم الزهور الجميل</p>
          <button class="btn-primary" style="max-width:220px" onclick="navigate('products')">تصفحي المنتجات 🌸</button>
        </div>`;
      return;
    }

    // Load order items for each order
    const orderWithItems = await Promise.all(orders.map(async o => {
      try {
        const items = await db.query('order_items', {
          select: 'quantity,unit_price,products(name_ar)',
          filter: { order_id: `eq.${o.id}` }
        });
        return { ...o, items };
      } catch {
        return { ...o, items: [] };
      }
    }));

    container.innerHTML = orderWithItems.map(o => `
      <div class="order-card" data-id="${o.id}" onclick="openOrderDetail('${o.id}')">
        <div class="order-header">
          <div>
            <div class="order-id">#${o.id.slice(-8).toUpperCase()}</div>
            <div class="order-date">${formatDate(o.created_at)}</div>
          </div>
          <span class="order-status ${statusClass(o.status)}">${o.status}</span>
        </div>
        <div class="order-items-preview">
          ${(o.items || []).map(i => `${i.products?.name_ar || 'منتج'} × ${i.quantity}`).join('، ') || 'بدون تفاصيل'}
        </div>
        <div class="order-footer">
          <span class="order-total">${parseFloat(o.total_amount).toFixed(2)} ر.س</span>
          <span style="color:var(--text-light);font-size:13px">عرض التفاصيل ←</span>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Orders error:', e);
    container.innerHTML = '<div class="loading"><p>خطأ في تحميل الطلبات</p></div>';
  }
}

/* ===== ORDER DETAIL ===== */
async function openOrderDetail(id) {
  haptic([6]);
  const order = state.orders.find(o => o.id === id);
  if (!order) return;
  state.selectedOrder = order;

  const content = $('order-detail-content');
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  openSheet('order-detail-sheet');

  try {
    const items = await db.query('order_items', {
      select: 'quantity,unit_price,products(name_ar)',
      filter: { order_id: `eq.${id}` }
    });

    content.innerHTML = `
      <div class="order-detail-status">
        <span class="order-status ${statusClass(order.status)}" style="font-size:14px;padding:8px 20px">${order.status}</span>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-size:12px;color:var(--text-light);margin-bottom:4px">رقم الطلب</div>
        <div style="font-weight:600">#${order.id.slice(-8).toUpperCase()}</div>
      </div>
      <div style="margin-bottom:16px">
        <div style="font-size:12px;color:var(--text-light);margin-bottom:4px">تاريخ الطلب</div>
        <div style="font-weight:600">${formatDate(order.created_at)}</div>
      </div>
      ${order.delivery_address ? `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;color:var(--text-light);margin-bottom:4px">عنوان التوصيل</div>
        <div style="font-weight:600">${order.delivery_address}</div>
      </div>` : ''}
      <div class="form-section-title" style="margin-bottom:12px">🛒 المنتجات</div>
      <div class="order-detail-items">
        ${items.map(i => `
          <div class="order-detail-item">
            <span>${i.products?.name_ar || 'منتج'} × ${i.quantity}</span>
            <span style="color:var(--burgundy);font-weight:600">${(i.unit_price * i.quantity).toFixed(2)} ر.س</span>
          </div>
        `).join('')}
        <div class="order-detail-item" style="font-weight:700;border-top:2px solid var(--border)">
          <span>الإجمالي</span>
          <span style="color:var(--burgundy)">${parseFloat(order.total_amount).toFixed(2)} ر.س</span>
        </div>
      </div>
      ${order.notes ? `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;color:var(--text-light);margin-bottom:4px">ملاحظات</div>
        <div style="font-size:14px;color:var(--text-secondary)">${order.notes}</div>
      </div>` : ''}
      <div class="form-section-title" style="margin-bottom:12px">✏️ تحديث الحالة</div>
      <select class="update-status-select" id="order-status-select">
        <option value="قيد الانتظار" ${order.status === 'قيد الانتظار' ? 'selected' : ''}>⏳ قيد الانتظار</option>
        <option value="قيد التجهيز" ${order.status === 'قيد التجهيز' ? 'selected' : ''}>🔄 قيد التجهيز</option>
        <option value="تم التوصيل" ${order.status === 'تم التوصيل' ? 'selected' : ''}>✅ تم التوصيل</option>
        <option value="ملغي" ${order.status === 'ملغي' ? 'selected' : ''}>❌ ملغي</option>
      </select>
      <button class="btn-primary ripple" onclick="updateOrderStatus('${order.id}')">حفظ التغييرات</button>
      <div style="height:12px"></div>
      <button class="btn-danger" style="width:100%;border-radius:12px;padding:14px" onclick="confirmDeleteOrder('${order.id}')">🗑️ حذف الطلب</button>
    `;
  } catch (e) {
    content.innerHTML = '<div class="loading"><p>خطأ في تحميل التفاصيل</p></div>';
  }
}

async function updateOrderStatus(id) {
  haptic([10]);
  const status = $('order-status-select').value;
  try {
    await db.update('orders', id, { status, updated_at: new Date().toISOString() });
    const order = state.orders.find(o => o.id === id);
    if (order) order.status = status;
    showToast('✓ تم تحديث حالة الطلب', 'success');
    closeSheet('order-detail-sheet');
    renderOrders();
  } catch (e) {
    showToast('❌ فشل التحديث', 'error');
  }
}

async function confirmDeleteOrder(id) {
  haptic([10, 50, 10]);
  if (!confirm('هل تريدين حذف هذا الطلب نهائياً؟')) return;
  try {
    // Delete order items first
    const items = await db.query('order_items', { filter: { order_id: `eq.${id}` } });
    for (const item of items) {
      await db.delete('order_items', item.id);
    }
    await db.delete('orders', id);
    state.orders = state.orders.filter(o => o.id !== id);
    showToast('تم حذف الطلب', '');
    closeSheet('order-detail-sheet');
    renderOrders();
  } catch (e) {
    showToast('❌ فشل الحذف', 'error');
  }
}

/* ===== RENDER ACCOUNT ===== */
function renderAccount() {
  const c = state.customer;
  const nameEl = $('account-name-display');
  const emailEl = $('account-email-display');
  if (nameEl) nameEl.textContent = c ? c.name : 'زائر';
  if (emailEl) emailEl.textContent = c ? (c.phone || 'لا يوجد') : 'قم بتسجيل أول طلب';

  const ordersCount = $('account-orders-count');
  if (ordersCount) ordersCount.textContent = state.orders.length || '—';
}

/* ===== MANAGE PRODUCTS (Admin) ===== */
async function openManageProducts() {
  haptic([6]);
  const content = $('manage-products-content');
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  openSheet('manage-products-sheet');

  if (state.products.length === 0) await loadProducts();

  content.innerHTML = `
    <button class="btn-primary ripple" onclick="openAddProduct()" style="margin-bottom:16px">+ إضافة منتج جديد</button>
    ${state.products.map(p => `
      <div class="admin-card">
        <div class="admin-card-header">
          <div class="admin-card-title">${p.name_ar}</div>
          <div>
            <button class="btn-edit" onclick="openEditProduct('${p.id}')">✏️ تعديل</button>
            <button class="btn-danger" onclick="deleteProduct('${p.id}')">🗑️</button>
          </div>
        </div>
        <div style="font-size:13px;color:var(--text-secondary)">${parseFloat(p.price).toFixed(2)} ر.س | المخزون: ${p.stock}</div>
      </div>
    `).join('')}
  `;
}

function openAddProduct() {
  haptic([6]);
  $('product-form-title').textContent = 'إضافة منتج جديد';
  $('product-form-id').value = '';
  $('product-form-name-ar').value = '';
  $('product-form-name-en').value = '';
  $('product-form-price').value = '';
  $('product-form-stock').value = '10';
  $('product-form-category').value = 'باقات';
  $('product-form-desc-ar').value = '';
  $('product-form-image').value = '';
  openSheet('product-form-sheet');
}

function openEditProduct(id) {
  haptic([6]);
  const p = state.products.find(x => x.id === id);
  if (!p) return;
  $('product-form-title').textContent = 'تعديل المنتج';
  $('product-form-id').value = p.id;
  $('product-form-name-ar').value = p.name_ar;
  $('product-form-name-en').value = p.name;
  $('product-form-price').value = p.price;
  $('product-form-stock').value = p.stock;
  $('product-form-category').value = p.category || 'باقات';
  $('product-form-desc-ar').value = p.description_ar || '';
  $('product-form-image').value = p.image_url || '';
  openSheet('product-form-sheet');
}

async function saveProduct() {
  haptic([10]);
  const id = $('product-form-id').value;
  const data = {
    name_ar: $('product-form-name-ar').value.trim(),
    name: $('product-form-name-en').value.trim() || $('product-form-name-ar').value.trim(),
    price: parseFloat($('product-form-price').value),
    stock: parseInt($('product-form-stock').value),
    category: $('product-form-category').value,
    description_ar: $('product-form-desc-ar').value.trim(),
    image_url: $('product-form-image').value.trim()
  };

  if (!data.name_ar || !data.price) {
    showToast('⚠️ يرجى ملء الاسم والسعر', 'error');
    return;
  }

  const btn = $('save-product-btn');
  btn.disabled = true;

  try {
    if (id) {
      await db.update('products', id, data);
      const idx = state.products.findIndex(p => p.id === id);
      if (idx !== -1) state.products[idx] = { ...state.products[idx], ...data };
      showToast('✓ تم تحديث المنتج', 'success');
    } else {
      const [newP] = await db.insert('products', data);
      state.products.push(newP);
      showToast('✓ تمت إضافة المنتج', 'success');
    }
    closeSheet('product-form-sheet');
    openManageProducts();
  } catch (e) {
    showToast('❌ حدث خطأ', 'error');
  } finally {
    btn.disabled = false;
  }
}

async function deleteProduct(id) {
  haptic([10, 50, 10]);
  if (!confirm('هل تريدين حذف هذا المنتج؟')) return;
  try {
    await db.delete('products', id);
    state.products = state.products.filter(p => p.id !== id);
    showToast('تم حذف المنتج', '');
    openManageProducts();
  } catch {
    showToast('❌ فشل الحذف', 'error');
  }
}

/* ===== SHEET HELPERS ===== */
function openSheet(id) {
  $('overlay').classList.add('active');
  $(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSheet(id) {
  $(id).classList.remove('active');
  $('overlay').classList.remove('active');
  document.body.style.overflow = '';
}

function closeAllSheets() {
  qsa('.bottom-sheet').forEach(s => s.classList.remove('active'));
  $('overlay').classList.remove('active');
  document.body.style.overflow = '';
}

/* ===== HELPERS ===== */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function statusClass(status) {
  const map = {
    'قيد الانتظار': 'status-pending',
    'قيد التجهيز': 'status-processing',
    'تم التوصيل': 'status-delivered',
    'ملغي': 'status-cancelled'
  };
  return map[status] || 'status-pending';
}

/* ===== PWA INSTALL ===== */
function setupPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    state.deferredInstallPrompt = e;
    const banner = $('install-banner');
    if (banner) banner.classList.add('visible');
  });

  window.addEventListener('appinstalled', () => {
    state.deferredInstallPrompt = null;
    const banner = $('install-banner');
    if (banner) banner.classList.remove('visible');
    showToast('🎉 تم تثبيت Roselle على جهازك!', 'success');
  });

  const installBtn = $('install-btn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!state.deferredInstallPrompt) return;
      haptic([10, 30, 10]);
      state.deferredInstallPrompt.prompt();
      const { outcome } = await state.deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        state.deferredInstallPrompt = null;
      }
    });
  }

  const closeBanner = $('close-install-banner');
  if (closeBanner) {
    closeBanner.addEventListener('click', () => {
      $('install-banner').classList.remove('visible');
    });
  }
}

/* ===== SERVICE WORKER ===== */
async function setupServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    state.swRegistration = reg;
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          const updateBanner = $('update-banner');
          if (updateBanner) updateBanner.classList.add('visible');
        }
      });
    });
  } catch (e) {
    console.error('SW registration failed:', e);
  }
}

function applyUpdate() {
  if (state.swRegistration && state.swRegistration.waiting) {
    state.swRegistration.waiting.postMessage('SKIP_WAITING');
    location.reload();
  }
}

/* ===== INIT ===== */
async function init() {
  // Splash screen
  setTimeout(() => {
    const splash = $('splash');
    if (splash) splash.classList.add('hidden');
  }, 2000);

  // Setup PWA
  setupPWA();
  setupServiceWorker();

  // Update cart badge
  updateCartBadge();

  // Setup nav
  qsa('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });

  // Overlay
  $('overlay').addEventListener('click', closeAllSheets);

  // Check URL for initial page
  const params = new URLSearchParams(location.search);
  const initPage = params.get('page') || 'home';
  navigate(initPage);
}

document.addEventListener('DOMContentLoaded', init);
