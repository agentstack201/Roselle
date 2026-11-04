const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType, VerticalAlign,
  PageBorderOffsetFrom, LevelFormat, LineRuleType, Footer, PageNumber, PageBreak
} = require('docx');

const SHOTS = '/home/user/Roselle/contacts-docs/screens';
const img = f => fs.readFileSync(path.join(SHOTS, f));

const SERIF = 'Times New Roman';
const MONO = 'Courier New';
const INK = '000000';
const BLUE = '1B4F8A';
const GREY = '555555';
const AUTO = LineRuleType.AUTO;
const CW = 9314;

const P = (text, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.BOTH,
  spacing: { after: o.after ?? 120, line: 276, lineRule: AUTO },
  children: [new TextRun({ text, font: SERIF, size: o.size || 22, bold: o.bold, color: o.color || INK })]
});

const H1 = text => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 320, after: 160, line: 276, lineRule: AUTO },
  keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 6 } },
  children: [new TextRun({ text, font: SERIF, size: 28, bold: true, color: INK })]
});

const H2 = text => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 240, after: 100, line: 276, lineRule: AUTO },
  keepNext: true,
  children: [new TextRun({ text, font: SERIF, size: 24, bold: true, color: INK })]
});

const BULLET = text => new Paragraph({
  numbering: { reference: 'dots', level: 0 },
  spacing: { after: 70, line: 276, lineRule: AUTO },
  children: [new TextRun({ text, font: SERIF, size: 22 })]
});

const NUM = text => new Paragraph({
  numbering: { reference: 'steps', level: 0 },
  spacing: { after: 70, line: 276, lineRule: AUTO },
  children: [new TextRun({ text, font: SERIF, size: 22 })]
});

const SPACER = (h = 120) => new Paragraph({ spacing: { after: h }, children: [] });
const BREAK = () => new Paragraph({ children: [new PageBreak()] });

const CODE = lines => new Table({
  width: { size: CW, type: WidthType.DXA },
  columnWidths: [CW],
  borders: {
    top: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
    left: { style: BorderStyle.SINGLE, size: 18, color: INK },
    right: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
  },
  rows: [new TableRow({
    children: [new TableCell({
      width: { size: CW, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: 'F4F4F4' },
      margins: { top: 120, bottom: 120, left: 160, right: 120 },
      children: lines.map(l => new Paragraph({
        spacing: { after: 0, line: 240, lineRule: AUTO },
        children: [new TextRun({ text: l, font: MONO, size: 17 })]
      }))
    })]
  })]
});

function TABLE(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (t, o = {}) => new TableCell({
    width: { size: o.w, type: WidthType.DXA },
    shading: o.head ? { type: ShadingType.CLEAR, fill: 'E8E8E8' } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      spacing: { after: 0, line: 252, lineRule: AUTO },
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
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, { head: true, w: widths[i] })) }),
      ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, { w: widths[i] })) }))
    ]
  });
}

const FIG = (file, w, sw, sh, type = 'jpg') => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 140, after: 60 },
  children: [new ImageRun({
    type, data: img(file),
    transformation: { width: w, height: Math.round(w * sh / sw) }
  })]
});

const CAP = text => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 200, line: 240, lineRule: AUTO },
  children: [new TextRun({ text, font: SERIF, size: 18, italics: true, color: GREY })]
});

/* ================= CONTENT ================= */
const children = [];

/* ---------- COVER ---------- */
children.push(
  SPACER(300),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new ImageRun({ type: 'jpg', data: img('0-ksu.jpg'), transformation: { width: 80, height: 95 } })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 300 },
    children: [new TextRun({ text: 'King Saud University', font: SERIF, size: 25, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 40 },
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 11 } },
    children: [new TextRun({ text: 'Contacts Directory', font: SERIF, size: 42, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 8 },
    children: [new TextRun({ text: 'A Web Application Connected to a Database', font: SERIF, size: 25 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 11 } },
    children: [new TextRun({ text: 'دفتر جهات الاتصال', font: SERIF, size: 23, color: BLUE })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 130 },
    children: [new TextRun({ text: 'Prepared by:', font: SERIF, size: 23, bold: true })]
  })
);

const W = [650, 3700, 2150];
children.push(new Table({
  width: { size: 6500, type: WidthType.DXA },
  columnWidths: W,
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
        width: { size: W[i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: 'E8E8E8' },
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: h, font: SERIF, size: 20, bold: true })]
        })]
      }))
    }),
    ...[1, 2, 3, 4].map(n => new TableRow({
      children: [String(n), '', ''].map((t, i) => new TableCell({
        width: { size: W[i], type: WidthType.DXA },
        margins: { top: 95, bottom: 95, left: 100, right: 100 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: t, font: SERIF, size: 20 })]
        })]
      }))
    }))
  ]
}));

children.push(
  SPACER(260),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 34 },
    children: [new TextRun({ text: 'College of Applied Studies', font: SERIF, size: 21 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 34 },
    children: [new TextRun({ text: 'Program of Natural Sciences and Engineering', font: SERIF, size: 21 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [new TextRun({ text: 'CT1552 — 1447 (1)', font: SERIF, size: 21, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 50, line: 200, lineRule: AUTO },
    children: [new TextRun({ text: 'Scan to open the live application', font: SERIF, size: 18, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 30 },
    children: [new ImageRun({ type: 'png', data: img('0-qr.png'), transformation: { width: 86, height: 86 } })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0, line: 180, lineRule: AUTO },
    children: [new TextRun({ text: 'contacts-ct1552.vercel.app', font: SERIF, size: 15, color: GREY })]
  }),
  BREAK()
);

/* ---------- FIRST ---------- */
children.push(
  H1('First: Project Function'),
  P('The project is a web application for keeping a directory of contacts. Access is controlled by a login page, and once signed in the user can view the stored contacts, add a new one, change the details of an existing one, or delete one.'),
  P('Every record is held in a PostgreSQL database hosted on Supabase, so the data remains after the browser is closed and is the same for anyone who opens the site.'),

  H2('Main Objectives'),
  BULLET('To control access to the application through a login page.'),
  BULLET('To display the stored contacts in a clear table.'),
  BULLET('To allow a new contact to be added through a simple form.'),
  BULLET('To allow the details of an existing contact to be changed.'),
  BULLET('To allow a contact to be deleted from the directory.'),

  H2('How the Application Works'),
  NUM('The user opens the site and is met by the login page, which checks the entered credentials against the users table in the database.'),
  NUM('After a correct login the directory page opens and reads the contacts from the database into a table.'),
  NUM('Choosing "add" opens a form with two fields, and saving it inserts a new row into the database.'),
  NUM('Choosing "edit" beside a contact opens the same fields already filled with that contact’s details, and saving updates the row.'),
  NUM('Choosing "delete" asks for confirmation and then removes the row.'),
  NUM('Choosing "logout" ends the session and returns to the login page.'),

  H2('Types of Data Handled'),
  SPACER(60),
  TABLE(
    ['Table', 'Field', 'Description'],
    [
      ['users', 'username, password', 'The credentials checked at login'],
      ['contacts', 'id', 'Record number, generated automatically'],
      ['contacts', 'name', 'The name of the contact'],
      ['contacts', 'phone', 'The mobile number of the contact'],
      ['contacts', 'created_at', 'The date the contact was added']
    ],
    [1700, 2800, 4814]
  ),
  SPACER(140),

  H2('Nature of the Application'),
  P('The application is an online one. The records are not kept inside the browser but in a database on a server, so the same directory appears on any device that opens the site and the data is not lost if the browser is cleared.')
);

/* ---------- SECOND ---------- */
children.push(
  H1('Second: Application Pages and Their Functions'),
  P('The application consists of four pages. The first controls access, and the other three carry out the operations on the stored records. A small bar at the top of every page shows the signed-in user and offers a logout link.'),

  H2('1. Login Page (index.html)'),
  P('This is the page the site opens on. It contains two fields, the user name and the password, and a login button. The entered values are checked against the users table in the database, and the user is only allowed through if a matching record is found.'),
  FIG('1-login.jpg', 330, 1480, 1120),
  CAP('Figure 1 — The login page'),
  P('If the credentials do not match any record, the application does not move on and a clear message is shown instead.'),
  FIG('2-login-error.jpg', 330, 1480, 1120),
  CAP('Figure 2 — The message shown when the credentials are wrong'),

  H2('2. Display Page (contacts.html)'),
  P('After a correct login the directory opens. It reads all the contacts from the database and shows them in a table containing the record number, the name and the mobile number. Beside every row there is a link that opens the edit page for that contact and a button that deletes it.'),
  FIG('3-list.jpg', 430, 1480, 876),
  CAP('Figure 3 — The directory after signing in'),

  H2('3. Add Page (add.html)'),
  P('This page holds the form used to add a new contact. Both fields are required, and a message appears on the page to confirm the addition.'),
  FIG('4-add.jpg', 400, 1480, 736),
  CAP('Figure 4 — The add form before saving'),
  FIG('5-add-done.jpg', 400, 1480, 834),
  CAP('Figure 5 — The confirmation after the contact has been saved'),

  P('Returning to the directory shows the new contact at the end of the table, which confirms that the record reached the database and was not only shown on the screen.'),
  FIG('6-after-add.jpg', 430, 1480, 978),
  CAP('Figure 6 — The directory after adding a contact'),

  H2('4. Edit Page (edit.html)'),
  P('The edit page receives the record number through the address of the page, reads that contact from the database, and fills the fields with its current details. Changing a field and saving updates the row.'),
  FIG('7-edit.jpg', 400, 1480, 736),
  CAP('Figure 7 — The edit form with the mobile number being changed'),
  FIG('8-edit-done.jpg', 400, 1480, 834),
  CAP('Figure 8 — The confirmation after the update'),

  P('The new value appears immediately in the directory.'),
  FIG('9-after-edit.jpg', 430, 1480, 978),
  CAP('Figure 9 — The directory after the update'),

  H2('5. Deleting a Contact'),
  P('Deleting is carried out from the directory page. Pressing the delete button beside a contact asks for confirmation first, and only then is the row removed from the database and the table read again.'),
  FIG('10-after-delete.jpg', 430, 1480, 974),
  CAP('Figure 10 — The directory after the contact has been deleted')
);

/* ---------- THIRD ---------- */
children.push(
  H1('Third: The Database'),
  P('The application is connected to a PostgreSQL database hosted on Supabase. It holds two tables: users, which stores the credentials used at login, and contacts, which stores the records the application displays and changes.'),
  FIG('11-db-schema.jpg', 500, 2160, 1104),
  CAP('Figure 11 — The structure of the two tables'),

  H2('Creating the Tables'),
  CODE([
    'CREATE TABLE users (',
    '  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,',
    '  username   TEXT NOT NULL UNIQUE,',
    '  password   TEXT NOT NULL,',
    '  created_at TIMESTAMPTZ DEFAULT NOW()',
    ');',
    '',
    'CREATE TABLE contacts (',
    '  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,',
    '  name       TEXT NOT NULL,',
    '  phone      TEXT NOT NULL,',
    '  created_at TIMESTAMPTZ DEFAULT NOW()',
    ');'
  ]),
  P('The id column of each table is the primary key and is generated automatically, so every record receives its own number without the user entering one. The columns that must always carry a value are marked NOT NULL, which means the database itself refuses an incomplete record even if the form were bypassed, and username is marked UNIQUE so the same user name cannot be registered twice.'),

  H2('Stored Data'),
  P('The following rows were read directly from the database.'),
  FIG('12-db-data.jpg', 500, 2160, 864),
  CAP('Figure 12 — The rows stored in the two tables'),

  H2('Connecting to the Database'),
  P('The connection is made over HTTPS using the interface that Supabase provides for the tables. A single file holds the address, the key and the functions the pages need, and each page calls the function it requires.'),
  CODE([
    "const BASE = 'https://pvyxlnjnbicnwwmugfca.supabase.co/rest/v1';",
    '',
    'const HEAD = {',
    "  'apikey'       : KEY,",
    "  'Authorization': 'Bearer ' + KEY,",
    "  'Content-Type' : 'application/json'",
    '};',
    '',
    '/* read all contacts */',
    'async function getAll() {',
    "  const res = await fetch(URL + '?select=*&order=id.asc', { headers: HEAD });",
    '  return res.json();',
    '}'
  ])
);

/* ---------- FOURTH ---------- */
children.push(
  H1('Fourth: Data Manipulation'),
  P('The project requires the website to display, add and update records through a form interface, and to allow records to be deleted. The application performs all four operations on the contacts table, and reads the users table when checking a login.'),
  SPACER(60),
  TABLE(
    ['Operation', 'Page', 'Method', 'What it does'],
    [
      ['Display', 'contacts.html, edit.html', 'GET', 'Reads the contacts and shows them'],
      ['Add', 'add.html', 'POST', 'Inserts a new contact'],
      ['Update', 'edit.html', 'PATCH', 'Changes an existing contact'],
      ['Delete', 'contacts.html', 'DELETE', 'Removes a contact'],
      ['Login check', 'index.html', 'GET', 'Reads the matching user record']
    ],
    [1600, 2900, 1200, 3614]
  ),
  SPACER(160),

  H2('Checking the login'),
  CODE([
    'async function checkLogin(username, password) {',
    '  const res = await fetch(',
    "    BASE + '/users?username=eq.' + encodeURIComponent(username) + '&select=*',",
    '    { headers: HEAD }',
    '  );',
    '  const rows = await res.json();',
    '',
    '  if (rows.length === 0) return null;',
    '  if (rows[0].password !== password) return null;',
    '',
    '  return rows[0];',
    '}'
  ]),

  H2('Adding'),
  CODE([
    'async function addContact(name, phone) {',
    '  await fetch(URL, {',
    "    method : 'POST',",
    '    headers: HEAD,',
    '    body   : JSON.stringify({ name: name, phone: phone })',
    '  });',
    '}'
  ]),

  H2('Updating'),
  CODE([
    'async function updateContact(id, name, phone) {',
    "  await fetch(URL + '?id=eq.' + id, {",
    "    method : 'PATCH',",
    '    headers: HEAD,',
    '    body   : JSON.stringify({ name: name, phone: phone })',
    '  });',
    '}'
  ]),

  H2('Deleting'),
  CODE([
    'async function deleteContact(id) {',
    "  await fetch(URL + '?id=eq.' + id, {",
    "    method : 'DELETE',",
    '    headers: HEAD',
    '  });',
    '}'
  ]),

  H2('Protecting the pages'),
  P('Every page that shows or changes records calls requireLogin() before anything else. A visitor who has not signed in is sent straight back to the login page.'),
  CODE([
    'function requireLogin() {',
    "  if (!sessionStorage.getItem('username')) {",
    "    location.href = 'index.html';",
    '    return false;',
    '  }',
    '  return true;',
    '}'
  ])
);

/* ---------- FIFTH ---------- */
children.push(
  H1('Fifth: Data Validation'),
  P('Validation is applied in three places, so that an incomplete record cannot reach the database.'),

  H2('In the browser'),
  P('Every field carries the required attribute, so the browser refuses to submit a form while any of them is empty.'),

  H2('In the page code'),
  P('Before a record is sent, the values are trimmed and checked again. If either is empty the request is not made and a message is shown on the page instead.'),
  CODE([
    "if (name === '' || phone === '') {",
    "  msg.textContent = 'الرجاء تعبئة جميع الحقول';",
    "  msg.className = 'msg show';",
    '  return;',
    '}'
  ]),

  H2('In the database'),
  P('The columns that must carry a value are declared NOT NULL, so the database refuses an empty value whichever page sent it, and username is UNIQUE so a duplicate account cannot be created. Deleting also asks the user to confirm, so a record cannot be lost by one accidental press.'),

  H2('A note on the password'),
  P('The password is stored as ordinary text in the users table, which is suitable for a course exercise using a test account. A system in real use would store a hashed form of the password rather than the password itself, so that the stored value could not be read even by someone who reached the table.'),
  BREAK(),

  H1('Sixth: Project Files'),
  P('The project is written in plain HTML, CSS and JavaScript and needs no additional programs to run.'),
  SPACER(60),
  TABLE(
    ['File', 'Function'],
    [
      ['index.html', 'The login page, and the entry point of the site'],
      ['contacts.html', 'The display page, and the place where deleting is carried out'],
      ['add.html', 'The form for adding a new contact'],
      ['edit.html', 'The form for changing an existing contact'],
      ['style.css', 'The appearance of the four pages'],
      ['db.js', 'The connection to the database and the functions the pages use']
    ],
    [2400, 6914]
  ),
  SPACER(160),

  H2('Publishing'),
  P('The application is published on the internet over HTTPS, and can be opened directly from the code printed on the cover of this report.'),
  SPACER(60),
  TABLE(
    ['Item', 'Value'],
    [
      ['Live application', 'https://contacts-ct1552.vercel.app'],
      ['Database', 'Supabase PostgreSQL 17, region eu-west-2'],
      ['Test account', 'admin / 123456']
    ],
    [2400, 6914]
  )
);

/* ---------- SEVENTH ---------- */
children.push(
  H1('Seventh: Summary of What Has Been Done'),
  P('The table below places each requirement of the project beside the part of the application that satisfies it.'),
  SPACER(60),
  TABLE(
    ['Requirement', 'How it is met'],
    [
      ['At least three core pages that display, add and update records',
       'contacts.html displays the records, add.html adds a new one, and edit.html updates an existing one, with a login page in front of them'],
      ['A reliable connection with a backend database',
       'A PostgreSQL database on Supabase holding the users and contacts tables, reached over HTTPS'],
      ['A user-friendly form interface to add, edit and delete records',
       'The login form, the add and edit forms, and the delete button with its confirmation, all validated before anything is sent']
    ],
    [3000, 6314]
  ),
  SPACER(200),

  H2('Closing Note'),
  P('The application covers the full set of operations on stored data, from controlling who may reach the records through to adding, changing and removing them. The directory is deliberately simple, with two tables and two fields of real content, so that the connection with the database and the operations performed on it can be followed clearly from end to end.'),
  SPACER(240),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 10 } },
    spacing: { before: 200 },
    children: [new TextRun({ text: 'Contacts Directory  ·  CT1552', font: SERIF, size: 20, color: GREY })]
  })
);

/* ================= DOCUMENT ================= */
const doc = new Document({
  creator: 'CT1552 Project Team',
  title: 'Contacts Directory — CT1552 Project Report',
  numbering: {
    config: [
      { reference: 'dots', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 520, hanging: 260 } }, run: { font: SERIF, size: 22 } } }] },
      { reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 520, hanging: 260 } }, run: { font: SERIF, size: 22 } } }] }
    ]
  },
  styles: {
    default: {
      document: { run: { font: SERIF, size: 22, color: INK },
                  paragraph: { spacing: { line: 276, lineRule: AUTO } } },
      heading1: { run: { font: SERIF, size: 28, bold: true, color: INK },
                  paragraph: { spacing: { before: 320, after: 160 }, keepNext: true } },
      heading2: { run: { font: SERIF, size: 24, bold: true, color: INK },
                  paragraph: { spacing: { before: 240, after: 100 }, keepNext: true } }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, bottom: 1440, left: 1296, right: 1296 },
        borders: {
          pageBorders: { offsetFrom: PageBorderOffsetFrom.PAGE },
          pageBorderTop: { style: BorderStyle.SINGLE, size: 30, color: INK, space: 24 },
          pageBorderBottom: { style: BorderStyle.SINGLE, size: 30, color: INK, space: 24 },
          pageBorderLeft: { style: BorderStyle.SINGLE, size: 30, color: INK, space: 24 },
          pageBorderRight: { style: BorderStyle.SINGLE, size: 30, color: INK, space: 24 }
        }
      }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120 },
          children: [new TextRun({ children: ['— ', PageNumber.CURRENT, ' —'], font: SERIF, size: 18, color: GREY })]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = '/home/user/Roselle/contacts-docs/Contacts_CT1552_Project_Report.docx';
  fs.writeFileSync(out, buf);
  console.log('written', out, (buf.length / 1024 / 1024).toFixed(2) + ' MB');
});
