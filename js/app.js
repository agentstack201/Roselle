/* ===================== STATE ===================== */
const S = {
  screen: 'home',
  stack: [],
  products: [],
  orders: [],
  cart: load('roselle_cart', []),
  favs: load('roselle_favs', []),
  customer: load('roselle_customer', null),
  cat: 'الكل',
  product: null,
  gallery: [],
  galleryIndex: 0,
  qty: 1,
  installPrompt: null,
  swReg: null,
  confirmAction: null
};

function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

const $ = id => document.getElementById(id);
const money = n => Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

/* ===================== HAPTICS ===================== */
const CAN_VIBRATE = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
const PATTERNS = { light: [9], medium: [16], strong: [26], ok: [12, 45, 20], warn: [22, 60, 22] };

function haptic(kind = 'light') {
  if (CAN_VIBRATE) { try { navigator.vibrate(PATTERNS[kind] || PATTERNS.light); } catch {} }
}

/* Every tappable element vibrates + gets a visual press fallback */
document.addEventListener('pointerdown', e => {
  const t = e.target.closest('button,[data-tap],.card,.tab,.chip,.menu-row,.order,.fav');
  if (!t || t.disabled) return;
  haptic(t.dataset.haptic || 'light');
  if (!CAN_VIBRATE) {
    t.classList.remove('tapped');
    void t.offsetWidth;
    t.classList.add('tapped');
    setTimeout(() => t.classList.remove('tapped'), 220);
  }
}, { passive: true });

/* ===================== TOAST ===================== */
let toastT;
function toast(msg, kind = '') {
  const el = $('toast');
  const ic = kind === 'ok' ? 'check' : kind === 'err' ? 'close' : 'info';
  el.innerHTML = icon(ic) + `<span>${msg}</span>`;
  el.className = 'toast ' + kind;
  void el.offsetWidth;
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('on'), 2600);
}

/* ===================== BRAND MARK ===================== */
const ROSE_MARK = `<svg viewBox="0 0 60 60" fill="none">
  <path d="M30 41C18.5 39.2 11 31.4 11 20.8c0-3.9.9-7 2.7-9.8 3 8.7 8.6 14.4 16.3 17.2z" fill="currentColor" opacity=".5"/>
  <path d="M30 41c11.5-1.8 19-9.6 19-20.2 0-3.9-.9-7-2.7-9.8-3 8.7-8.6 14.4-16.3 17.2z" fill="currentColor" opacity=".5"/>
  <path d="M30 41.5c-5.9-5-9-11.9-9-18.9S24.1 9.1 30 4.5c5.9 4.6 9 11.1 9 18.1s-3.1 13.9-9 18.9z" fill="currentColor"/>
  <path d="M30 41v14" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M30 48c-3.6 0-7-2.2-8.4-5.6 3.8-1 7.1.6 8.4 5.6zM30 48c3.6 0 7-2.2 8.4-5.6-3.8-1-7.1.6-8.4 5.6z" fill="currentColor" opacity=".7"/>
</svg>`;

/* ===================== NAV ===================== */
const TABS = [
  { id: 'home', label: 'الرئيسية', ic: 'home' },
  { id: 'store', label: 'المنتجات', ic: 'grid' },
  { id: 'cart', label: 'السلة', ic: 'cart', badge: true },
  { id: 'orders', label: 'طلباتي', ic: 'receipt' },
  { id: 'account', label: 'حسابي', ic: 'user' }
];

function buildTabs() {
  $('tabbar').innerHTML = TABS.map(t => `
    <button class="tab" data-screen="${t.id}">
      <span class="tab-ic">${icon(t.ic)}${t.badge ? '<span class="tab-badge" id="tabBadge">0</span>' : ''}</span>
      <span>${t.label}</span>
    </button>`).join('');
  $('tabbar').querySelectorAll('.tab').forEach(b =>
    b.addEventListener('click', () => go(b.dataset.screen)));
}

const TAB_IDS = TABS.map(t => t.id);

function go(screen, push = true) {
  if (push && S.screen !== screen) S.stack.push(S.screen);
  if (TAB_IDS.includes(screen)) S.stack = [];
  S.screen = screen;

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  $('s-' + screen)?.classList.add('on');

  document.querySelectorAll('.tab').forEach(t =>
    t.classList.toggle('on', t.dataset.screen === screen));

  $('scroll').scrollTop = 0;
  window.scrollTo(0, 0);
  syncBar();

  ({ home: renderHome, store: renderStore, cart: renderCart,
     checkout: renderCheckout, orders: renderOrders,
     account: renderAccount, admin: renderAdmin })[screen]?.();

  history.replaceState({ screen }, '', screen === 'home' ? '/' : '/?v=' + screen);
}

function back() {
  const prev = S.stack.pop();
  go(prev || 'store', false);
}

/* App-bar left/right buttons change per screen */
function syncBar() {
  const r = $('barRight');
  const onSub = !TAB_IDS.includes(S.screen);
  r.innerHTML = onSub ? icon('back') : icon('search');
  r.setAttribute('aria-label', onSub ? 'رجوع' : 'بحث');
  r.onclick = onSub ? back : () => toast('البحث سيتوفّر قريباً');
}

/* ===================== CART ===================== */
const SHIPPING = 25;
const subtotal = () => S.cart.reduce((s, i) => s + i.price * i.qty, 0);
const cartCount = () => S.cart.reduce((s, i) => s + i.qty, 0);

function syncCart() {
  save('roselle_cart', S.cart);
  const n = cartCount();
  [$('barBadge'), $('tabBadge')].forEach(b => {
    if (!b) return;
    b.textContent = n;
    b.classList.toggle('on', n > 0);
  });
}

function addToCart(p, qty = 1) {
  const hit = S.cart.find(i => i.id === p.id);
  if (hit) hit.qty += qty;
  else S.cart.push({ id: p.id, name: p.name_ar, price: Number(p.price), img: p.image_url, qty });
  syncCart();
  haptic('ok');
}

function setQty(id, d) {
  const i = S.cart.find(x => x.id === id);
  if (!i) return;
  i.qty += d;
  if (i.qty < 1) S.cart = S.cart.filter(x => x.id !== id);
  syncCart();
  renderCart();
}

function dropItem(id) {
  S.cart = S.cart.filter(i => i.id !== id);
  syncCart();
  renderCart();
  toast('أُزيل من السلة');
}

/* ===================== FAVOURITES ===================== */
function toggleFav(id, el) {
  const on = S.favs.includes(id);
  S.favs = on ? S.favs.filter(f => f !== id) : [...S.favs, id];
  save('roselle_favs', S.favs);
  if (el) {
    el.classList.toggle('on', !on);
    el.innerHTML = icon(!on ? 'heartFill' : 'heart');
  }
  haptic(on ? 'light' : 'medium');
}

/* ===================== DATA ===================== */
async function fetchProducts(force = false) {
  if (S.products.length && !force) return S.products;
  try {
    S.products = await db.query('products', { order: 'sort_order.asc' });
  } catch (e) {
    console.error(e);
    toast('تعذّر تحميل المنتجات', 'err');
  }
  return S.products;
}

function galleryOf(p) {
  if (Array.isArray(p.gallery) && p.gallery.length) return p.gallery;
  return p.image_url ? [p.image_url] : [];
}

/* ===================== CARDS ===================== */
function cardHTML(p) {
  const fav = S.favs.includes(p.id);
  return `
  <article class="card" data-id="${p.id}">
    <div class="card-media">
      <div class="ph">${icon('bouquet')}</div>
      ${p.image_url ? `<img src="${p.image_url}" alt="${p.name_ar}" loading="lazy" onerror="this.remove()">` : ''}
      <button class="fav ${fav ? 'on' : ''}" data-fav="${p.id}" data-haptic="medium" aria-label="المفضلة">${icon(fav ? 'heartFill' : 'heart')}</button>
    </div>
    <div class="card-body">
      <h4 class="card-name">${p.name_ar}</h4>
      <div class="card-price">${money(p.price)} <small>ر.س</small></div>
      <button class="btn-add" data-add="${p.id}" data-haptic="ok">${icon('cart')} إضافة للسلة</button>
    </div>
  </article>`;
}

function wireGrid(root) {
  root.querySelectorAll('[data-fav]').forEach(b =>
    b.addEventListener('click', e => { e.stopPropagation(); toggleFav(b.dataset.fav, b); }));

  root.querySelectorAll('[data-add]').forEach(b =>
    b.addEventListener('click', e => {
      e.stopPropagation();
      const p = S.products.find(x => x.id === b.dataset.add);
      if (!p) return;
      addToCart(p);
      b.classList.add('done');
      b.innerHTML = icon('check') + ' تمت الإضافة';
      setTimeout(() => { b.classList.remove('done'); b.innerHTML = icon('cart') + ' إضافة للسلة'; }, 1400);
    }));

  root.querySelectorAll('.card').forEach(c =>
    c.addEventListener('click', e => {
      if (e.target.closest('[data-add],[data-fav]')) return;
      openProduct(c.dataset.id);
    }));
}

/* ===================== HOME ===================== */
async function renderHome() {
  const hero = $('hero');
  if (!hero.dataset.ready) {
    hero.innerHTML = `
      <img src="/images/taif-rose.jpg" alt="ورد الطائف" onerror="this.remove()">
      <div class="hero-txt">
        <h2>ورد الطائف الطبيعي</h2>
        <p>من مزارع الطائف إلى بابك، بعبقٍ لا يُنسى</p>
        <button class="hero-cta" data-go="store">تسوّق الآن ${icon('back')}</button>
      </div>`;
    hero.dataset.ready = '1';
    hero.querySelector('[data-go]')?.addEventListener('click', () => go('store'));
  }

  await fetchProducts();

  $('homeStats').innerHTML = [
    ['bouquet', S.products.length, 'منتج'],
    ['box', S.orders.length, 'طلب'],
    ['heart', S.favs.length, 'مفضلة']
  ].map(([i, v, l]) => `<div class="stat">${icon(i)}<b>${v}</b><span>${l}</span></div>`).join('');

  const g = $('homeGrid');
  g.innerHTML = S.products.slice(0, 4).map(cardHTML).join('');
  wireGrid(g);
}

/* ===================== STORE ===================== */
async function renderStore() {
  const grid = $('storeGrid');
  if (!S.products.length) {
    grid.innerHTML = `<div class="loader"><div class="spin"></div><p>جارٍ تحميل المنتجات…</p></div>`;
    await fetchProducts();
  }

  const CHIP_IC = {
    'الكل': 'grid', 'ورد الطائف': 'bouquet',
    'الفل السعودي': 'blossom', 'الأزهار المحلية': 'leaf'
  };
  const cats = ['الكل', ...new Set(S.products.map(p => p.category).filter(Boolean))];
  $('chips').innerHTML = cats.map(c =>
    `<button class="chip ${c === S.cat ? 'on' : ''}" data-cat="${c}">${icon(CHIP_IC[c] || 'blossom')}<span>${c}</span></button>`
  ).join('');
  $('chips').querySelectorAll('.chip').forEach(ch =>
    ch.addEventListener('click', () => { S.cat = ch.dataset.cat; renderStore(); }));

  const list = S.cat === 'الكل' ? S.products : S.products.filter(p => p.category === S.cat);
  grid.innerHTML = list.length
    ? list.map(cardHTML).join('')
    : `<div class="loader"><p>لا توجد منتجات في هذا التصنيف</p></div>`;
  wireGrid(grid);
}

/* ===================== PRODUCT DETAIL ===================== */
function openProduct(id) {
  const p = S.products.find(x => x.id === id);
  if (!p) return;
  S.product = p;
  S.qty = 1;
  S.gallery = galleryOf(p);
  S.galleryIndex = 0;

  $('pName').textContent = p.name_ar;
  $('pPrice').innerHTML = `${money(p.price)} <small>ر.س</small>`;
  $('pDesc').textContent = p.description_ar || p.description || '';
  $('pQty').textContent = '1';
  paintGallery();
  go('product');
}

function paintGallery() {
  const p = S.product;
  const src = S.gallery[S.galleryIndex];
  const fav = S.favs.includes(p.id);

  $('pMedia').innerHTML = `
    <div class="ph">${icon('bouquet')}</div>
    ${src ? `<img src="${src}" alt="${p.name_ar}" onerror="this.remove()">` : ''}
    <button class="fav ${fav ? 'on' : ''}" id="pFav" data-haptic="medium" aria-label="المفضلة">${icon(fav ? 'heartFill' : 'heart')}</button>
    ${p.origin_badge ? `<div class="origin-tag">${icon('saudi')}<div><b>${p.category}</b><span>${p.origin_badge}</span></div></div>` : ''}`;

  $('pFav').addEventListener('click', () => toggleFav(p.id, $('pFav')));

  $('pDots').innerHTML = S.gallery.length > 1
    ? S.gallery.map((_, i) => `<i class="${i === S.galleryIndex ? 'on' : ''}"></i>`).join('')
    : '';
}

/* swipe between gallery images */
let swipeX = null;
$('pMedia').addEventListener('touchstart', e => { swipeX = e.changedTouches[0].clientX; }, { passive: true });
$('pMedia').addEventListener('touchend', e => {
  if (swipeX === null || S.gallery.length < 2) return;
  const dx = e.changedTouches[0].clientX - swipeX;
  swipeX = null;
  if (Math.abs(dx) < 45) return;
  const dir = dx > 0 ? -1 : 1;                       // RTL: swipe right → previous
  S.galleryIndex = (S.galleryIndex + dir + S.gallery.length) % S.gallery.length;
  haptic('light');
  paintGallery();
}, { passive: true });

$('pMinus').addEventListener('click', () => {
  if (S.qty > 1) { S.qty--; $('pQty').textContent = S.qty; }
});
$('pPlus').addEventListener('click', () => {
  S.qty++; $('pQty').textContent = S.qty;
});
$('pAdd').addEventListener('click', () => {
  addToCart(S.product, S.qty);
  toast('أُضيف إلى السلة', 'ok');
  go('cart');
});

/* ===================== CART ===================== */
function renderCart() {
  const w = $('cartWrap');
  if (!S.cart.length) {
    w.innerHTML = `
      <div class="empty">
        <div class="ring">${icon('cart')}</div>
        <h3>سلتك فارغة</h3>
        <p>تصفّح منتجاتنا وأضف ما يعجبك<br>لتبدأ تجربة تسوّق مميزة</p>
        <button class="btn btn-primary" data-go="store">تصفّح المتجر</button>
      </div>`;
    w.querySelector('[data-go]').addEventListener('click', () => go('store'));
    return;
  }

  const sub = subtotal();
  w.innerHTML = `
    <div class="cart-list">
      ${S.cart.map(i => `
        <div class="cart-row">
          <div class="cart-thumb">${i.img ? `<img src="${i.img}" alt="${i.name}" onerror="this.remove()">` : icon('bouquet')}</div>
          <div class="cart-info">
            <h4>${i.name}</h4>
            <div class="p">${money(i.price * i.qty)} ر.س</div>
            <div class="stepper">
              <button data-q="-1" data-id="${i.id}" aria-label="إنقاص">${icon('minus')}</button>
              <b>${i.qty}</b>
              <button data-q="1" data-id="${i.id}" aria-label="زيادة">${icon('plus')}</button>
            </div>
          </div>
          <button class="cart-del" data-del="${i.id}" data-haptic="warn" aria-label="حذف">${icon('trash')}</button>
        </div>`).join('')}
    </div>
    <div class="summary">
      <div class="sum-row"><span>الإجمالي الفرعي</span><b>${money(sub)} ر.س</b></div>
      <div class="sum-row"><span>رسوم التوصيل</span><b>${money(SHIPPING)} ر.س</b></div>
      <div class="sum-row total"><span>المجموع</span><b>${money(sub + SHIPPING)} ر.س</b></div>
    </div>
    <div class="sticky-cta"><button class="btn btn-primary" id="toCheckout" data-haptic="medium">${icon('check')} متابعة الطلب</button></div>`;

  w.querySelectorAll('[data-q]').forEach(b =>
    b.addEventListener('click', () => setQty(b.dataset.id, Number(b.dataset.q))));
  w.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => dropItem(b.dataset.del)));
  $('toCheckout').addEventListener('click', () => go('checkout'));
}

/* ===================== CHECKOUT ===================== */
function renderCheckout() {
  if (!S.cart.length) { go('cart'); return; }
  const sub = subtotal();
  $('coSub').textContent = money(sub) + ' ر.س';
  $('coShip').textContent = money(SHIPPING) + ' ر.س';
  $('coTotal').textContent = money(sub + SHIPPING) + ' ر.س';

  if (S.customer) {
    $('fName').value = S.customer.name || '';
    $('fPhone').value = S.customer.phone || '';
    $('fAddr').value = S.customer.address || '';
  }
}

async function placeOrder() {
  const name = $('fName').value.trim();
  const phone = $('fPhone').value.trim();
  const address = $('fAddr').value.trim();
  const notes = $('fNotes').value.trim();

  if (!name || !phone || !address) {
    haptic('warn');
    toast('أكمل الحقول المطلوبة', 'err');
    return;
  }

  const btn = $('placeBtn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spin" style="width:19px;height:19px;border-width:2px;border-top-color:#fff"></span> جارٍ التأكيد…`;

  try {
    let customerId = S.customer?.id;
    if (!customerId) {
      const [c] = await db.insert('customers', { name, phone, address });
      customerId = c.id;
      S.customer = c;
    } else {
      await db.update('customers', customerId, { name, phone, address });
      S.customer = { ...S.customer, name, phone, address };
    }
    save('roselle_customer', S.customer);

    const [order] = await db.insert('orders', {
      customer_id: customerId,
      total_amount: subtotal() + SHIPPING,
      notes,
      delivery_address: address,
      status: 'قيد الانتظار'
    });

    await db.insert('order_items', S.cart.map(i => ({
      order_id: order.id, product_id: i.id, quantity: i.qty, unit_price: i.price
    })));

    S.cart = [];
    syncCart();
    $('fNotes').value = '';
    haptic('ok');
    toast('تم تأكيد طلبك بنجاح', 'ok');
    go('orders');
  } catch (e) {
    console.error(e);
    haptic('warn');
    toast('تعذّر إرسال الطلب، حاول مجدداً', 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = 'تأكيد الطلب';
  }
}

/* ===================== ORDERS ===================== */
const PILL = {
  'قيد الانتظار': 'wait', 'قيد التجهيز': 'prep',
  'تم التوصيل': 'done', 'ملغي': 'cancel'
};
const STATUSES = ['قيد الانتظار', 'قيد التجهيز', 'تم التوصيل', 'ملغي'];

const fmtDate = s => new Date(s).toLocaleDateString('ar-SA',
  { year: 'numeric', month: 'long', day: 'numeric' });

async function renderOrders() {
  const w = $('ordersWrap');
  if (!S.customer) {
    w.innerHTML = emptyOrders();
    w.querySelector('[data-go]').addEventListener('click', () => go('store'));
    return;
  }

  w.innerHTML = `<div class="loader"><div class="spin"></div><p>جارٍ تحميل طلباتك…</p></div>`;

  try {
    const rows = await db.query('orders', {
      select: '*,order_items(quantity,unit_price,products(name_ar))',
      filter: { customer_id: `eq.${S.customer.id}` },
      order: 'created_at.desc'
    });
    S.orders = rows;

    if (!rows.length) {
      w.innerHTML = emptyOrders();
      w.querySelector('[data-go]').addEventListener('click', () => go('store'));
      return;
    }

    w.innerHTML = `<div class="orders">${rows.map(o => `
      <div class="order" data-id="${o.id}">
        <div class="order-top">
          <div>
            <div class="order-no">طلب #${o.id.slice(-6).toUpperCase()}</div>
            <div class="order-date">${fmtDate(o.created_at)}</div>
          </div>
          <span class="pill ${PILL[o.status] || 'wait'}">${o.status}</span>
        </div>
        <div class="order-items">${(o.order_items || [])
          .map(i => `${i.products?.name_ar || 'منتج'} × ${i.quantity}`).join(' · ') || '—'}</div>
        <div class="order-bot">
          <span class="order-total">${money(o.total_amount)} ر.س</span>
          <span class="order-more">التفاصيل ${icon('back')}</span>
        </div>
      </div>`).join('')}</div><div style="height:18px"></div>`;

    w.querySelectorAll('.order').forEach(c =>
      c.addEventListener('click', () => openOrder(c.dataset.id)));
  } catch (e) {
    console.error(e);
    w.innerHTML = `<div class="loader"><p>تعذّر تحميل الطلبات</p></div>`;
  }
}

const emptyOrders = () => `
  <div class="empty">
    <div class="ring">${icon('receipt')}</div>
    <h3>لا توجد طلبات بعد</h3>
    <p>عند إتمام أول طلب ستجده هنا<br>مع إمكانية تتبّع حالته</p>
    <button class="btn btn-primary" data-go="store">ابدأ التسوّق</button>
  </div>`;

function openOrder(id) {
  const o = S.orders.find(x => x.id === id);
  if (!o) return;

  $('sheetOrderBody').innerHTML = `
    <div style="text-align:center;padding-bottom:18px">
      <span class="pill ${PILL[o.status] || 'wait'}" style="font-size:13px;padding:8px 18px">${o.status}</span>
    </div>
    ${[['رقم الطلب', '#' + o.id.slice(-6).toUpperCase()],
       ['التاريخ', fmtDate(o.created_at)],
       ['عنوان التوصيل', o.delivery_address || '—'],
       ...(o.notes ? [['ملاحظات', o.notes]] : [])]
      .map(([k, v]) => `<div style="margin-bottom:13px">
          <div style="font-size:11.5px;color:var(--muted);margin-bottom:3px">${k}</div>
          <div style="font-size:14px;font-weight:600">${v}</div></div>`).join('')}

    <div class="form-head" style="padding:10px 0 10px">${icon('cart')} المنتجات</div>
    ${(o.order_items || []).map(i => `
      <div class="sum-row"><span>${i.products?.name_ar || 'منتج'} × ${i.quantity}</span>
        <b style="color:var(--wine)">${money(i.unit_price * i.quantity)} ر.س</b></div>`).join('')}
    <div class="sum-row total"><span>المجموع</span><b>${money(o.total_amount)} ر.س</b></div>

    <div class="form-head" style="padding:20px 0 10px">${icon('edit')} تحديث الحالة</div>
    <div class="field">
      <select id="stSel">${STATUSES.map(s =>
        `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
    </div>
    <button class="btn btn-primary" id="stSave" data-haptic="medium">حفظ التغييرات</button>
    <div style="height:10px"></div>
    <button class="btn btn-danger" id="stDel" data-haptic="warn">${icon('trash')} حذف الطلب</button>
    <div style="height:14px"></div>`;

  $('stSave').addEventListener('click', async () => {
    const status = $('stSel').value;
    try {
      await db.update('orders', o.id, { status, updated_at: new Date().toISOString() });
      o.status = status;
      closeSheet('sheetOrder');
      toast('تم تحديث حالة الطلب', 'ok');
      renderOrders();
    } catch { toast('تعذّر التحديث', 'err'); }
  });

  $('stDel').addEventListener('click', () =>
    confirmAsk('حذف الطلب', 'سيتم حذف هذا الطلب وجميع عناصره نهائياً. لا يمكن التراجع عن هذا الإجراء.', async () => {
      try {
        await db.deleteWhere('order_items', { order_id: `eq.${o.id}` });
        await db.delete('orders', o.id);
        S.orders = S.orders.filter(x => x.id !== o.id);
        closeSheet('sheetOrder');
        toast('تم حذف الطلب');
        renderOrders();
      } catch { toast('تعذّر الحذف', 'err'); }
    }));

  openSheet('sheetOrder');
}

/* ===================== ACCOUNT ===================== */
function renderAccount() {
  $('acctIc').innerHTML = icon('user');
  $('acctName').textContent = S.customer?.name || 'زائر';
  $('acctSub').textContent = S.customer?.phone || 'سجّل أول طلب لتظهر بياناتك هنا';

  const items = [
    ['receipt', 'طلباتي', `${S.orders.length} طلب`, () => go('orders')],
    ['grid', 'إدارة المنتجات', 'إضافة وتعديل وحذف', () => go('admin')],
    ['heart', 'المفضلة', `${S.favs.length} منتج`, () => { S.cat = 'الكل'; go('store'); }],
    ['phone', 'تواصل معنا', '920001234', () => toast('هاتف خدمة العملاء: 920001234')],
    ['info', 'عن التطبيق', 'Roselle · الإصدار 2.0', () => toast('Roselle — متجر الزهور السعودية')]
  ];

  $('acctMenu').innerHTML = items.map(([ic, t, s]) => `
    <div class="menu-row">
      <div class="menu-ic">${icon(ic)}</div>
      <div class="menu-txt"><b>${t}</b><span>${s}</span></div>
      ${icon('back')}
    </div>`).join('');

  $('acctMenu').querySelectorAll('.menu-row').forEach((r, i) =>
    r.addEventListener('click', items[i][3]));
}

/* ===================== ADMIN (products CRUD) ===================== */
async function renderAdmin() {
  const w = $('adminList');
  w.innerHTML = `<div class="loader"><div class="spin"></div></div>`;
  await fetchProducts(true);

  w.innerHTML = S.products.map(p => `
    <div class="admin-row">
      <div class="t"><b>${p.name_ar}</b><span>${money(p.price)} ر.س · المخزون ${p.stock}</span></div>
      <button class="ibtn e" data-edit="${p.id}" aria-label="تعديل">${icon('edit')}</button>
      <button class="ibtn d" data-del="${p.id}" data-haptic="warn" aria-label="حذف">${icon('trash')}</button>
    </div>`).join('');

  w.querySelectorAll('[data-edit]').forEach(b =>
    b.addEventListener('click', () => productForm(b.dataset.edit)));

  w.querySelectorAll('[data-del]').forEach(b =>
    b.addEventListener('click', () => {
      const p = S.products.find(x => x.id === b.dataset.del);
      confirmAsk('حذف المنتج', `سيتم حذف «${p.name_ar}» نهائياً من المتجر.`, async () => {
        try {
          await db.delete('products', p.id);
          S.products = S.products.filter(x => x.id !== p.id);
          closeSheet('sheetConfirm');
          toast('تم حذف المنتج');
          renderAdmin();
        } catch { toast('تعذّر الحذف — قد يكون مرتبطاً بطلبات', 'err'); }
      });
    }));
}

function productForm(id) {
  const p = id ? S.products.find(x => x.id === id) : null;
  $('pfTitle').textContent = p ? 'تعديل المنتج' : 'إضافة منتج';
  $('pfId').value = p?.id || '';
  $('pfNameAr').value = p?.name_ar || '';
  $('pfNameEn').value = p?.name || '';
  $('pfPrice').value = p?.price || '';
  $('pfStock').value = p?.stock ?? 20;
  $('pfCat').value = p?.category || 'ورد الطائف';
  $('pfDesc').value = p?.description_ar || '';
  $('pfImg').value = p?.image_url || '';
  openSheet('sheetProduct');
}

async function saveProduct() {
  const name_ar = $('pfNameAr').value.trim();
  const price = parseFloat($('pfPrice').value);

  if (!name_ar || !(price >= 0)) {
    haptic('warn');
    toast('الاسم والسعر مطلوبان', 'err');
    return;
  }

  const data = {
    name_ar,
    name: $('pfNameEn').value.trim() || name_ar,
    price,
    stock: parseInt($('pfStock').value) || 0,
    category: $('pfCat').value,
    description_ar: $('pfDesc').value.trim(),
    image_url: $('pfImg').value.trim() || null
  };

  const btn = $('pfSave');
  btn.disabled = true;

  try {
    const id = $('pfId').value;
    if (id) await db.update('products', id, data);
    else await db.insert('products', { ...data, origin_badge: 'منتج سعودي', sort_order: 99 });
    closeSheet('sheetProduct');
    toast(id ? 'تم تحديث المنتج' : 'تمت إضافة المنتج', 'ok');
    renderAdmin();
  } catch (e) {
    console.error(e);
    toast('تعذّر الحفظ', 'err');
  } finally {
    btn.disabled = false;
  }
}

/* ===================== SHEETS ===================== */
function openSheet(id) {
  $('scrim').classList.add('on');
  $(id).classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closeSheet(id) {
  $(id).classList.remove('on');
  $('scrim').classList.remove('on');
  document.body.style.overflow = '';
}
function closeAll() {
  document.querySelectorAll('.sheet').forEach(s => s.classList.remove('on'));
  $('scrim').classList.remove('on');
  document.body.style.overflow = '';
}

function confirmAsk(title, msg, action) {
  $('cfTitle').textContent = title;
  $('cfMsg').textContent = msg;
  S.confirmAction = action;
  openSheet('sheetConfirm');
}

/* ===================== PWA ===================== */
function setupPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    S.installPrompt = e;
    if (!load('roselle_install_hidden', false)) $('installBanner').classList.add('on');
  });

  window.addEventListener('appinstalled', () => {
    S.installPrompt = null;
    $('installBanner').classList.remove('on');
    toast('تم تثبيت Roselle على جهازك', 'ok');
  });

  $('installIc').innerHTML = ICONS.download;
  $('installX').innerHTML = icon('close');

  $('installBtn').addEventListener('click', async () => {
    if (!S.installPrompt) return;
    haptic('medium');
    S.installPrompt.prompt();
    await S.installPrompt.userChoice;
    S.installPrompt = null;
    $('installBanner').classList.remove('on');
  });

  $('installX').addEventListener('click', () => {
    save('roselle_install_hidden', true);
    $('installBanner').classList.remove('on');
  });
}

async function setupSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    S.swReg = reg;
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw?.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller)
          $('updateBar').classList.add('on');
      });
    });
  } catch (e) { console.error('SW:', e); }
}

function netStatus() {
  const bar = $('offlineBar');
  const off = !navigator.onLine;
  bar.classList.toggle('on', off);
  if (off) bar.innerHTML = icon('info') + ' أنت غير متصل — التصفّح متاح، وإرسال الطلبات يحتاج اتصالاً';
}

/* ===================== INIT ===================== */
function init() {
  $('brandMark').innerHTML = ROSE_MARK;
  $('goIc').innerHTML = ICONS.back;
  $('coIc').innerHTML = ICONS.mapPin;
  $('pMinus').innerHTML = icon('minus');
  $('pPlus').innerHTML = icon('plus');
  $('pAdd').innerHTML = icon('cart') + ' إضافة للسلة';

  buildTabs();
  syncCart();
  setupPWA();
  setupSW();
  netStatus();

  addEventListener('online', netStatus);
  addEventListener('offline', netStatus);

  $('barCart').insertAdjacentHTML('afterbegin', ICONS.cart);
  $('barCart').addEventListener('click', () => go('cart'));

  $('updateBtn').addEventListener('click', () => {
    S.swReg?.waiting?.postMessage('SKIP_WAITING');
    location.reload();
  });

  $('scrim').addEventListener('click', closeAll);
  document.querySelectorAll('[data-close]').forEach(b => {
    b.innerHTML = icon('close');
    b.addEventListener('click', () => closeSheet(b.dataset.close));
  });

  $('placeBtn').addEventListener('click', placeOrder);
  $('pfSave').addEventListener('click', saveProduct);
  $('addProdBtn').addEventListener('click', () => productForm(null));
  $('cfYes').addEventListener('click', () => S.confirmAction?.());

  addEventListener('popstate', () => { if (S.stack.length) back(); });

  go(new URLSearchParams(location.search).get('v') || 'home', false);

  setTimeout(() => $('splash').classList.add('gone'), 1900);
}

document.addEventListener('DOMContentLoaded', init);
