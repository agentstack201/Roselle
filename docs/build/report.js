const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType, VerticalAlign,
  PageBorderOffsetFrom, PageOrientation, LevelFormat, convertInchesToTwip,
  Header, Footer, PageNumber, TabStopType, LineRuleType
} = require('docx');

const SHOTS = '/home/user/Roselle/docs/screens';
const IMGS = '/home/user/Roselle/images';

const SERIF = 'Times New Roman';
const MONO = 'Courier New';
const INK = '000000';
const WINE = '7D1634';
const GREY = '555555';

const img = f => fs.readFileSync(path.join(SHOTS, f));
const asset = f => fs.readFileSync(path.join(IMGS, f));

/* ---------- building blocks ---------- */

const P = (text, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.BOTH,
  spacing: { after: o.after ?? 120, line: o.line ?? 276, lineRule: LineRuleType.AUTO },
  indent: o.indent,
  children: [new TextRun({
    text, font: SERIF, size: o.size || 22,
    bold: o.bold, italics: o.italics, color: o.color || INK
  })]
});

const RICH = (runs, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.BOTH,
  spacing: { after: o.after ?? 120, line: 276, lineRule: LineRuleType.AUTO },
  children: runs.map(r => new TextRun({
    text: r.t, font: r.font || SERIF, size: r.size || 22,
    bold: r.b, italics: r.i, color: r.c || INK
  }))
});

const H1 = text => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 320, after: 160 },
  keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 6 } },
  children: [new TextRun({ text, font: SERIF, size: 28, bold: true, color: INK })]
});

const H2 = text => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 100 },
  keepNext: true,
  children: [new TextRun({ text, font: SERIF, size: 24, bold: true, color: INK })]
});

const H3 = text => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 180, after: 80 },
  keepNext: true,
  children: [new TextRun({ text, font: SERIF, size: 22, bold: true, color: WINE })]
});

const BULLET = (text, lvl = 0) => new Paragraph({
  numbering: { reference: 'dots', level: lvl },
  spacing: { after: 70, line: 276, lineRule: LineRuleType.AUTO },
  children: [new TextRun({ text, font: SERIF, size: 22 })]
});

const NUM = text => new Paragraph({
  numbering: { reference: 'steps', level: 0 },
  spacing: { after: 70, line: 276, lineRule: LineRuleType.AUTO },
  children: [new TextRun({ text, font: SERIF, size: 22 })]
});

const SPACER = (h = 120) => new Paragraph({ spacing: { after: h }, children: [] });

/* code block: shaded, bordered, monospace */
const CODE = lines => new Table({
  width: { size: 9314, type: WidthType.DXA },
  columnWidths: [9314],
  borders: {
    top:    { style: BorderStyle.SINGLE, size: 6, color: '999999' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
    left:   { style: BorderStyle.SINGLE, size: 18, color: INK },
    right:  { style: BorderStyle.SINGLE, size: 6, color: '999999' },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE }
  },
  rows: [new TableRow({
    children: [new TableCell({
      width: { size: 9314, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: 'F4F4F4' },
      margins: { top: 120, bottom: 120, left: 160, right: 120 },
      children: lines.map(l => new Paragraph({
        spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO },
        children: [new TextRun({ text: l, font: MONO, size: 17 })]
      }))
    })]
  })]
});

/* data table with header row */
function TABLE(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (t, o = {}) => new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.head ? { type: ShadingType.CLEAR, fill: 'E8E8E8' } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: o.align || AlignmentType.LEFT,
      spacing: { after: 0, line: 252, lineRule: LineRuleType.AUTO },
      children: [new TextRun({ text: t, font: SERIF, size: 20, bold: o.head })]
    })]
  });
  return new Table({
    width: { size: total, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: INK },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: INK },
      left: { style: BorderStyle.SINGLE, size: 12, color: INK },
      right: { style: BorderStyle.SINGLE, size: 12, color: INK },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '888888' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '888888' }
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => cell(h, { head: true, w: widths[i] }))
      }),
      ...rows.map(r => new TableRow({
        children: r.map((c, i) => cell(c, { w: widths[i] }))
      }))
    ]
  });
}

/* phone screenshots, two per row, with captions */
const PH_W = 142, PH_H = Math.round(150 * 1212 / 560);

function screenRow(items) {
  const col = 4657;
  const cellFor = it => new TableCell({
    width: { size: col, type: WidthType.DXA },
    margins: { top: 60, bottom: 120, left: 60, right: 60 },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }
    },
    children: it ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new ImageRun({
          type: 'jpg', data: img(it.file),
          transformation: { width: PH_W, height: PH_H }
        })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [new TextRun({ text: it.cap, font: SERIF, size: 18, bold: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO },
        children: [new TextRun({ text: it.sub, font: SERIF, size: 17, color: GREY })]
      })
    ] : [new Paragraph({ children: [] })]
  });

  return new Table({
    width: { size: 9314, type: WidthType.DXA },
    columnWidths: [col, col],
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
    },
    rows: [new TableRow({ children: [cellFor(items[0]), cellFor(items[1] || null)] })]
  });
}

const wideImg = (file, widthPx, srcW, srcH) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 120, after: 80 },
  children: [new ImageRun({
    type: 'jpg', data: img(file),
    transformation: { width: widthPx, height: Math.round(widthPx * srcH / srcW) }
  })]
});

const CAP = text => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200 },
  children: [new TextRun({ text, font: SERIF, size: 18, italics: true, color: GREY })]
});

const PAGEBREAK = () => new Paragraph({ children: [new (require('docx').PageBreak)()] });

/* ================= DOCUMENT ================= */

const children = [];

/* ---------- COVER ---------- */
children.push(
  SPACER(700),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new ImageRun({
      type: 'jpg', data: img('00-logo.jpg'),
      transformation: { width: 150, height: 150 }
    })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: 'Roselle', font: SERIF, size: 64, bold: true, color: INK })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [new TextRun({
      text: 'F L O W E R   S H O P', font: SERIF, size: 22, color: WINE
    })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 40 },
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 10 } },
    children: [new TextRun({
      text: 'A Mobile-First Progressive Web Application',
      font: SERIF, size: 28, bold: true
    })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 500 },
    children: [new TextRun({
      text: 'for an Online Saudi Flower Store', font: SERIF, size: 26
    })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: 'Prepared by:', font: SERIF, size: 24, bold: true })]
  })
);

children.push(
  new Table({
    width: { size: 7000, type: WidthType.DXA },
    columnWidths: [700, 4000, 2300],
    alignment: AlignmentType.CENTER,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 12, color: INK },
      bottom: { style: BorderStyle.SINGLE, size: 12, color: INK },
      left: { style: BorderStyle.SINGLE, size: 12, color: INK },
      right: { style: BorderStyle.SINGLE, size: 12, color: INK },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '888888' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '888888' }
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: ['#', 'Student Name', 'Student ID'].map((h, i) => new TableCell({
          width: { size: [700, 4000, 2300][i], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: 'E8E8E8' },
          margins: { top: 80, bottom: 80, left: 110, right: 110 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: h, font: SERIF, size: 21, bold: true })]
          })]
        }))
      }),
      ...[1, 2, 3, 4].map(n => new TableRow({
        children: [String(n), '', ''].map((t, i) => new TableCell({
          width: { size: [700, 4000, 2300][i], type: WidthType.DXA },
          margins: { top: 110, bottom: 110, left: 110, right: 110 },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: t, font: SERIF, size: 21 })]
          })]
        }))
      }))
    ]
  })
);

children.push(
  SPACER(500),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'King Saud University', font: SERIF, size: 24, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'College of Applied Studies', font: SERIF, size: 22 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({
      text: 'Program of Natural Sciences and Engineering', font: SERIF, size: 22
    })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 0 },
    children: [new TextRun({ text: 'CT1552 — 1447 (1)', font: SERIF, size: 22, bold: true })]
  }),
  PAGEBREAK()
);

/* ---------- 1. PROJECT FUNCTION ---------- */
children.push(
  H1('First: Project Function'),
  P('Roselle is an online flower store delivered as a Progressive Web Application (PWA). It allows a customer to browse a catalogue of Saudi flowers, inspect a product in detail, build a shopping cart, submit an order, and then track or modify that order afterwards. Every record the application shows or changes is stored in a PostgreSQL database hosted on Supabase, which the application reaches over HTTPS.'),
  P('Unlike a conventional responsive website, Roselle is designed mobile-first and can be installed onto the home screen of a phone. Once installed it opens in its own window, without the browser interface, and its interface continues to load even when the device has no network connection.'),

  H2('Main Objectives'),
  BULLET('To present a catalogue of Saudi flower products in a clear and organised way.'),
  BULLET('To let the customer complete a full purchase journey from browsing to order confirmation.'),
  BULLET('To store every product, customer and order in a reliable backend database.'),
  BULLET('To provide a user-friendly form interface for adding, editing and deleting records.'),
  BULLET('To deliver the experience as an installable application rather than an ordinary web page.'),

  H2('How the Application Works'),
  NUM('Launch. A splash screen presents the Roselle identity while the application shell and the service worker are initialised.'),
  NUM('Browsing. The Store screen loads the product list from the database and lets the customer filter it by category.'),
  NUM('Product inspection. Selecting a product opens a dedicated screen with a photo gallery, description, origin badge and a quantity selector.'),
  NUM('Cart. Chosen products are collected in a cart where quantities can be increased, decreased or removed.'),
  NUM('Checkout. The customer submits name, mobile number and delivery address. The application creates the customer, the order and its line items in the database.'),
  NUM('Order management. The My Orders screen lists the submitted orders and allows the status to be updated or the order to be deleted.'),
  NUM('Administration. A management screen provides a form interface to add, edit and delete products in the catalogue.'),

  H2('Key Features'),
  BULLET('Mobile-first Arabic (RTL) interface with a fixed bottom navigation bar.'),
  BULLET('Live product catalogue read from the database.'),
  BULLET('Category filtering and a swipeable product image gallery.'),
  BULLET('Persistent shopping cart and favourites kept on the device.'),
  BULLET('Full create, read, update and delete operations on products and orders.'),
  BULLET('Installable PWA with an offline fallback page and automatic update notice.'),
  BULLET('Haptic (vibration) feedback on every control, with a visual alternative where vibration is unavailable.'),

  H2('Types of Data Handled'),
  SPACER(60),
  TABLE(
    ['Data', 'Description', 'Where it is stored'],
    [
      ['Product data', 'Name, description, price, category, stock, images', 'Supabase database'],
      ['Customer data', 'Name, mobile number, delivery address', 'Supabase database'],
      ['Order data', 'Status, total amount, notes, delivery address', 'Supabase database'],
      ['Order items', 'Product, quantity and unit price per order line', 'Supabase database'],
      ['Cart and favourites', 'Items selected before checkout', 'Browser local storage'],
      ['Interface state', 'Current screen, selected quantity, active filter', 'Application memory']
    ],
    [2000, 4600, 2714]
  ),
  SPACER(140),

  H2('Nature of the Application'),
  P('Roselle is an online application. The catalogue, the customers and the orders live in a shared database, so the data is the same on every device that opens the store and persists independently of the browser. The service worker caches the interface files and product images so the application still opens without a connection; database operations such as submitting an order naturally require the network and the application states this clearly to the user rather than pretending to succeed.'),
  PAGEBREAK()
);

/* ---------- 2. SCREENS ---------- */
children.push(
  H1('Second: Application Screens and Their Functions'),
  P('The application is divided into independent screens reached through a fixed bottom navigation bar containing five destinations: Home, Products, Cart, My Orders and Account. The screens below are taken from the deployed application running on a mobile device.'),

  H2('1. Splash and Home'),
  P('The splash screen displays the Roselle identity for a short moment while the application initialises, then the Home screen appears. Home presents a featured banner, summary counters and a selection of the most requested products.'),
  screenRow([
    { file: '01-splash.jpg', cap: 'Splash Screen', sub: 'Brand identity on launch' },
    { file: '02-home.jpg', cap: 'Home Screen', sub: 'Banner, counters and featured products' }
  ]),

  H2('2. Store and Filtering'),
  P('The Store screen lists the complete catalogue in a two-column grid. Category chips along the top filter the grid; the active category is highlighted in the Burgundy brand colour. Each card shows the product photo, name, price, a favourite button and an add-to-cart button.'),
  screenRow([
    { file: '03-store.jpg', cap: 'Store Screen', sub: 'Full catalogue with category chips' },
    { file: '04-store-filter.jpg', cap: 'Filtered Store', sub: 'Showing the Taif Rose category only' }
  ]),

  H2('3. Product Detail and Cart'),
  P('Selecting a product opens its own screen with a swipeable image gallery, a dot indicator, a favourite button, a Saudi-origin badge, the price, a full description and a quantity stepper. Adding the product moves the customer to the Cart, where quantities can be adjusted and items removed, and where the subtotal, delivery fee and total are calculated.'),
  screenRow([
    { file: '05-product.jpg', cap: 'Product Detail Screen', sub: 'Gallery, origin badge and quantity' },
    { file: '06-cart.jpg', cap: 'Cart Screen', sub: 'Quantities, removal and order summary' }
  ]),

  H2('4. Checkout and My Orders'),
  P('The Checkout screen is the main data-entry form of the application. It collects the customer name, mobile number and delivery address, together with optional notes, and repeats the order summary. On confirmation the records are written to the database and the customer is taken to the My Orders screen.'),
  screenRow([
    { file: '07-checkout.jpg', cap: 'Checkout Screen', sub: 'Delivery form and order summary' },
    { file: '08-orders.jpg', cap: 'My Orders Screen', sub: 'Submitted orders with status' }
  ]),

  H2('5. Order Detail and Status Update'),
  P('Opening an order reveals its full detail: order number, date, delivery address, notes, line items and total. A status selector allows the order to be moved between Pending, In Preparation, Delivered and Cancelled, and a delete action removes the order together with its line items. This screen demonstrates the update and delete operations required by the project.'),
  screenRow([
    { file: '09-order-detail.jpg', cap: 'Order Detail', sub: 'Full record with status selector' },
    { file: '10-order-updated.jpg', cap: 'After Update', sub: 'Status saved back to the database' }
  ]),

  H2('6. Account and Product Management'),
  P('The Account screen shows the stored customer details and gives access to orders, favourites and the product management area. Product management lists every catalogue record with edit and delete controls, and an add button that opens the product form.'),
  screenRow([
    { file: '11-account.jpg', cap: 'Account Screen', sub: 'Customer details and menu' },
    { file: '12-admin.jpg', cap: 'Product Management', sub: 'Edit and delete every product' }
  ]),

  H2('7. Product Form and Offline Page'),
  P('The product form is used for both adding a new product and editing an existing one. It validates that a name and a price are present before writing to the database. The offline page is served by the service worker when a page is requested with no network available.'),
  screenRow([
    { file: '13-product-form.jpg', cap: 'Product Form', sub: 'Add and edit catalogue records' },
    { file: '14-offline.jpg', cap: 'Offline Page', sub: 'Shown when there is no connection' }
  ]),
  PAGEBREAK()
);

/* ---------- 3. DATABASE ---------- */
children.push(
  H1('Third: Database Design and Connectivity'),
  P('The application is backed by a PostgreSQL 17 database hosted on Supabase. The schema contains four related tables that together describe the catalogue, the customers and the orders placed against them.'),
  wideImg('15-db-schema.jpg', 576, 2480, 2310),
  CAP('Figure 1 — Database schema: tables, column types, primary keys and foreign keys'),
  PAGEBREAK(),

  H2('Tables'),
  SPACER(60),
  TABLE(
    ['Table', 'Purpose', 'Key columns'],
    [
      ['products', 'The flower catalogue displayed in the store', 'id, name_ar, price, category, stock, gallery'],
      ['customers', 'People who have placed an order', 'id, name, phone, address'],
      ['orders', 'One row for each submitted order', 'id, customer_id, status, total_amount'],
      ['order_items', 'The products belonging to each order', 'id, order_id, product_id, quantity, unit_price']
    ],
    [1900, 4100, 3314]
  ),
  SPACER(160),

  H2('Relationships'),
  BULLET('orders.customer_id references customers.id — each order belongs to exactly one customer.'),
  BULLET('order_items.order_id references orders.id — an order has many line items.'),
  BULLET('order_items.product_id references products.id — each line item refers to one catalogue product.'),
  P('Deleting a customer cascades to their orders, and deleting an order cascades to its line items, so the database can never be left holding orphaned rows.'),

  H2('Creating the Tables'),
  P('The schema was created with the following SQL statements:'),
  CODE([
    'CREATE TABLE products (',
    '  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
    '  name        TEXT NOT NULL,',
    '  name_ar     TEXT NOT NULL,',
    '  description_ar TEXT,',
    '  price       DECIMAL(10,2) NOT NULL,',
    '  image_url   TEXT,',
    '  gallery     JSONB,',
    '  category    TEXT,',
    '  stock       INTEGER DEFAULT 10,',
    '  created_at  TIMESTAMPTZ DEFAULT NOW()',
    ');',
    '',
    'CREATE TABLE orders (',
    '  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
    '  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,',
    "  status      TEXT DEFAULT 'Pending',",
    '  total_amount DECIMAL(10,2) NOT NULL,',
    '  delivery_address TEXT,',
    '  notes       TEXT,',
    '  created_at  TIMESTAMPTZ DEFAULT NOW()',
    ');'
  ]),
  PAGEBREAK(),

  H2('Live Data'),
  P('The following rows were read directly from the database after using the application, and show real products together with the customers and orders created through the checkout form.'),
  wideImg('16-db-data.jpg', 576, 2480, 1902),
  CAP('Figure 2 — Live rows from the four tables'),

  H2('Connecting to the Database'),
  P('The application communicates with Supabase through its REST interface over HTTPS. A small client module wraps the four operations the application needs. Requests carry the project’s public key, and row-level security policies on the database control what that key is permitted to do.'),
  CODE([
    "const SUPABASE_URL = 'https://pvyxlnjnbicnwwmugfca.supabase.co';",
    '',
    'async insert(table, data) {',
    '  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {',
    "    method : 'POST',",
    '    headers: {',
    "      'apikey'       : SUPABASE_ANON_KEY,",
    "      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,",
    "      'Content-Type' : 'application/json',",
    "      'Prefer'       : 'return=representation'",
    '    },',
    '    body: JSON.stringify(data)',
    '  });',
    '  if (!res.ok) throw new Error(await res.text());',
    '  return res.json();',
    '}'
  ]),
  PAGEBREAK()
);

/* ---------- 4. CRUD ---------- */
children.push(
  H1('Fourth: Data Manipulation'),
  P('The project requires the website to display, add and update records through a user-friendly form interface. Roselle implements all four operations on two separate entities, products and orders, so that the requirement is met from both the customer side and the administrative side.'),
  SPACER(60),
  TABLE(
    ['Operation', 'Where it happens', 'What it does'],
    [
      ['Display', 'Store, Home, My Orders', 'Reads products and orders and renders them on screen'],
      ['Add', 'Checkout form; Product form', 'Creates a customer, an order and its items; creates a product'],
      ['Update', 'Order detail; Product form', 'Changes an order status; edits any field of a product'],
      ['Delete', 'Order detail; Product management', 'Removes an order with its items; removes a product']
    ],
    [1700, 3100, 4514]
  ),
  SPACER(160),

  H3('Adding an order'),
  P('When the checkout form is confirmed, three inserts run in sequence: the customer record, the order header and the order line items.'),
  CODE([
    "const [c] = await db.insert('customers', { name, phone, address });",
    '',
    "const [order] = await db.insert('orders', {",
    '  customer_id      : c.id,',
    '  total_amount     : subtotal() + SHIPPING,',
    '  delivery_address : address,',
    '  notes            : notes,',
    "  status           : 'Pending'",
    '});',
    '',
    "await db.insert('order_items', S.cart.map(i => ({",
    '  order_id   : order.id,',
    '  product_id : i.id,',
    '  quantity   : i.qty,',
    '  unit_price : i.price',
    '})));'
  ]),

  H3('Updating an order'),
  P('The status selector on the order detail screen issues a PATCH request against the single matching row.'),
  CODE([
    "await db.update('orders', order.id, {",
    '  status     : selectedStatus,',
    '  updated_at : new Date().toISOString()',
    '});'
  ]),
  PAGEBREAK()
);

/* ---------- 5. DATA TRANSFER, VALIDATION, STORAGE ---------- */
children.push(
  H1('Fifth: Data Transfer Between Screens'),
  P('Roselle is a single-page application. Rather than loading a new document for every screen, a small router keeps all screens in the same page and shows only the active one. Data therefore does not need to be serialised into a URL or posted between pages; it is held in a single application state object and read directly by whichever screen needs it.'),
  BULLET('Selecting a product stores it in the state and the product screen reads it from there.'),
  BULLET('The cart is held in the state and mirrored to local storage so it survives a restart.'),
  BULLET('The customer identifier is kept after the first order so later orders can be linked to the same person.'),
  BULLET('Navigation also updates the address bar, so a screen can be reopened directly from a link or an installed shortcut.'),

  H1('Sixth: Data Validation'),
  P('Validation is applied at the points where data enters the system.'),
  H3('Checkout form'),
  P('The name, mobile number and delivery address are all required. If any is empty the order is not sent, a warning message is shown and the device gives a short double vibration so the failure is noticed even without reading the screen.'),
  H3('Product form'),
  P('A product cannot be saved without an Arabic name and a valid, non-negative price. The price and stock fields use numeric input modes so that phones present a numeric keypad.'),
  H3('Database level'),
  P('The database enforces the rules that must hold regardless of the interface: primary keys are generated automatically, prices and quantities are NOT NULL, and foreign keys guarantee that an order always refers to a real customer and a line item always refers to a real order and a real product.'),
  CODE([
    'if (!name || !phone || !address) {',
    "  haptic('warn');",
    "  toast('Please complete the required fields', 'err');",
    '  return;',
    '}'
  ]),
  PAGEBREAK(),

  H1('Seventh: Data Storage Locations'),
  H3('1. Database storage (Supabase PostgreSQL)'),
  P('Holds everything that must be shared and permanent: products, customers, orders and order items. This data is identical on every device that opens the store and is not lost when the browser is cleared.'),
  H3('2. Local storage on the device'),
  P('Holds the shopping cart, the favourites list and the current customer record. This keeps the cart intact if the application is closed and reopened, and avoids asking a returning customer for their details again.'),
  H3('3. In-memory state'),
  P('Holds values that are only meaningful while the application is open: the active screen, the selected quantity, the chosen category filter and the loaded product list. This data is discarded when the application closes.'),
  H3('4. Service worker cache'),
  P('Holds the interface files and the product images so the application can open without a connection. Database responses are deliberately excluded from the cache: orders and customer details are never written to it, so no personal information is left behind on the device.'),
  CODE([
    '/* Never cache the API: orders, carts and customer records must always',
    '   be live, and caching them would leave personal data on the device. */',
    "if (url.hostname.endsWith('supabase.co')) return;"
  ]),
  PAGEBREAK()
);

/* ---------- 6. PWA ---------- */
children.push(
  H1('Eighth: Progressive Web Application Features'),
  P('The requirement for this project was extended so that Roselle behaves as a real installable application on a phone rather than a desktop site viewed on a small screen. The following features were implemented to achieve that.'),
  SPACER(60),
  TABLE(
    ['Feature', 'Implementation'],
    [
      ['Web App Manifest', 'Name Roselle, standalone display, portrait orientation, Arabic RTL, theme colour #9C1C41'],
      ['Application icons', 'Eight sizes from 72 to 512 pixels, plus two maskable icons, generated from the Roselle logo'],
      ['Splash screen', 'Produced by the system from the manifest icon, name and background colour'],
      ['Service worker', 'Pre-caches the interface shell; cache-first for images, network-first for navigation'],
      ['Offline fallback', 'A dedicated offline page served when a navigation fails'],
      ['Installability', 'Install banner shown when the browser signals the application can be installed'],
      ['Update handling', 'A notice appears when a new version is available, and reloads on confirmation'],
      ['Application shortcuts', 'Store, My Orders and Cart available by long-pressing the installed icon'],
      ['Haptic feedback', 'Short vibration on every control, with a visual press effect as an alternative']
    ],
    [2600, 6714]
  ),
  SPACER(160),

  H2('Haptic Feedback'),
  P('A single listener covers the whole interface, so every button, card, navigation tab and category chip responds to touch. Different actions use different vibration patterns: a light tap for navigation, a longer pattern for a successful order and a double pulse for a validation error. Devices without a vibration motor receive a brief visual press effect instead, so the feedback is never lost.'),
  CODE([
    "const CAN_VIBRATE = typeof navigator.vibrate === 'function';",
    '',
    "document.addEventListener('pointerdown', e => {",
    "  const t = e.target.closest('button,[data-tap],.card,.tab,.chip');",
    '  if (!t || t.disabled) return;',
    "  haptic(t.dataset.haptic || 'light');",
    '  if (!CAN_VIBRATE) {            // visual alternative',
    "    t.classList.add('tapped');",
    "    setTimeout(() => t.classList.remove('tapped'), 220);",
    '  }',
    '}, { passive: true });'
  ]),
  PAGEBREAK()
);

/* ---------- 7. FILES ---------- */
children.push(
  H1('Ninth: Project Files and Their Functions'),
  P('The project is built with HTML, CSS and JavaScript and requires no build step, which keeps the structure easy to read and to present.'),
  SPACER(60),
  TABLE(
    ['File', 'Function'],
    [
      ['index.html', 'Defines the structure of every screen and the bottom navigation bar'],
      ['css/app.css', 'All styling: the Burgundy theme, the mobile-first layout and the RTL direction'],
      ['js/app.js', 'Application logic: routing, cart, checkout, orders, product management and haptics'],
      ['js/supabase-client.js', 'The database client wrapping select, insert, update and delete'],
      ['js/icons.js', 'The line icon set drawn as inline SVG'],
      ['sw.js', 'The service worker: caching strategy, offline fallback and update handling'],
      ['manifest.json', 'The Web App Manifest describing name, icons, colours and shortcuts'],
      ['offline.html', 'The page shown when a screen is requested with no connection'],
      ['images/', 'Product photography and the Roselle logo'],
      ['icons/', 'Application icons in all required sizes']
    ],
    [2600, 6714]
  ),
  SPACER(160),

  H1('Tenth: Deployment'),
  P('The source code is version-controlled on GitHub and deployed to Vercel, which serves it over HTTPS. HTTPS is a requirement for a service worker and therefore for installability.'),
  SPACER(60),
  TABLE(
    ['Item', 'Value'],
    [
      ['Live application', 'https://roselle-flower-shop.vercel.app'],
      ['Source repository', 'github.com/agentstack201/Roselle'],
      ['Database', 'Supabase PostgreSQL 17, region eu-west-2'],
      ['Hosting', 'Vercel, static delivery over HTTPS']
    ],
    [2600, 6714]
  ),
  PAGEBREAK()
);

/* ---------- 8. SUMMARY ---------- */
children.push(
  H1('Eleventh: Summary of What Has Been Done'),
  P('The table below maps each requirement in the project guidelines to the part of Roselle that satisfies it.'),
  SPACER(60),
  TABLE(
    ['Requirement', 'How it is met'],
    [
      ['At least three core pages that display, add and update records',
       'Store displays products; Checkout adds customers, orders and order items; Order Detail updates the order status; Product Management adds, edits and deletes products'],
      ['Reliable connection with a backend database',
       'PostgreSQL on Supabase, reached over HTTPS through its REST interface, with row-level security policies'],
      ['A user-friendly form interface to add, edit and delete records',
       'The checkout form, the product form and the order status selector, all validated before submission'],
      ['Mobile-first installable application',
       'Manifest, service worker, icons, offline page, install prompt and update notice']
    ],
    [3000, 6314]
  ),
  SPACER(200),

  H2('Closing Note'),
  P('Roselle delivers a complete purchase journey on top of a relational database, with all four data operations exercised from a touch interface designed for a phone. The catalogue is drawn from Saudi flowers — the Taif rose, Saudi jasmine, basil and bougainvillea — so that the product range reflects a local identity as well as a technical exercise.'),
  SPACER(300),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 10 } },
    spacing: { before: 200 },
    children: [new TextRun({
      text: 'Roselle  ·  Flower Shop  ·  CT1552', font: SERIF, size: 20, color: GREY
    })]
  })
);

/* ================= ASSEMBLE ================= */

const doc = new Document({
  creator: 'Roselle Project Team',
  title: 'Roselle — Flower Shop Progressive Web Application',
  description: 'CT1552 project report',
  numbering: {
    config: [
      {
        reference: 'dots',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 520, hanging: 260 } },
                   run: { font: SERIF, size: 22 } }
        }]
      },
      {
        reference: 'steps',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 520, hanging: 260 } },
                   run: { font: SERIF, size: 22 } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: SERIF, size: 22, color: INK },
                  paragraph: { spacing: { line: 276, lineRule: LineRuleType.AUTO } } },
      title:    { run: { font: SERIF, size: 56, bold: true, color: INK },
                  paragraph: { spacing: { before: 0, after: 200 }, keepNext: true } },
      heading1: { run: { font: SERIF, size: 28, bold: true, color: INK },
                  paragraph: { spacing: { before: 320, after: 160 }, keepNext: true } },
      heading2: { run: { font: SERIF, size: 24, bold: true, color: INK },
                  paragraph: { spacing: { before: 240, after: 100 }, keepNext: true } },
      heading3: { run: { font: SERIF, size: 22, bold: true, color: WINE },
                  paragraph: { spacing: { before: 180, after: 80 }, keepNext: true } }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },          // A4
        margin: { top: 1440, bottom: 1440, left: 1296, right: 1296 },
        borders: {
          pageBorders: { offsetFrom: PageBorderOffsetFrom.PAGE },
          pageBorderTop:    { style: BorderStyle.SINGLE, size: 30, color: INK, space: 24 },
          pageBorderBottom: { style: BorderStyle.SINGLE, size: 30, color: INK, space: 24 },
          pageBorderLeft:   { style: BorderStyle.SINGLE, size: 30, color: INK, space: 24 },
          pageBorderRight:  { style: BorderStyle.SINGLE, size: 30, color: INK, space: 24 }
        }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120 },
          children: [new TextRun({
            children: ['— ', PageNumber.CURRENT, ' —'],
            font: SERIF, size: 18, color: GREY
          })]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = '/home/user/Roselle/docs/Roselle_CT1552_Project_Report.docx';
  fs.writeFileSync(out, buf);
  console.log('written', out, (buf.length / 1024 / 1024).toFixed(2) + ' MB');
});
