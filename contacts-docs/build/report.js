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

const CONTENT_W = 9314;

/* ---------- blocks ---------- */
const P = (text, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.BOTH,
  spacing: { after: o.after ?? 120, line: 276, lineRule: AUTO },
  children: [new TextRun({
    text, font: SERIF, size: o.size || 22,
    bold: o.bold, italics: o.italics, color: o.color || INK
  })]
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
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [CONTENT_W],
  borders: {
    top: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
    left: { style: BorderStyle.SINGLE, size: 18, color: INK },
    right: { style: BorderStyle.SINGLE, size: 6, color: '999999' },
    insideHorizontal: { style: BorderStyle.NONE },
    insideVertical: { style: BorderStyle.NONE }
  },
  rows: [new TableRow({
    children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
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
      alignment: o.align || AlignmentType.LEFT,
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

const FIG = (file, widthPx, srcW, srcH) => new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 140, after: 60 },
  children: [new ImageRun({
    type: 'jpg', data: img(file),
    transformation: { width: widthPx, height: Math.round(widthPx * srcH / srcW) }
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
  SPACER(500),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [new ImageRun({
      type: 'jpg', data: img('0-ksu.jpg'),
      transformation: { width: 92, height: 109 }
    })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 420 },
    children: [new TextRun({ text: 'King Saud University', font: SERIF, size: 26, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 40 },
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 12 } },
    children: [new TextRun({ text: 'Contacts Directory', font: SERIF, size: 44, bold: true })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 10 },
    children: [new TextRun({ text: 'A Web Application Connected to a Database', font: SERIF, size: 26 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 420 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 12 } },
    children: [new TextRun({ text: 'دفتر جهات الاتصال', font: SERIF, size: 24, color: BLUE })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [new TextRun({ text: 'Prepared by:', font: SERIF, size: 24, bold: true })]
  })
);

const W = [700, 4000, 2300];
children.push(new Table({
  width: { size: 7000, type: WidthType.DXA },
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
        margins: { top: 80, bottom: 80, left: 110, right: 110 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: h, font: SERIF, size: 21, bold: true })]
        })]
      }))
    }),
    ...[1, 2, 3, 4].map(n => new TableRow({
      children: [String(n), '', ''].map((t, i) => new TableCell({
        width: { size: W[i], type: WidthType.DXA },
        margins: { top: 110, bottom: 110, left: 110, right: 110 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: t, font: SERIF, size: 21 })]
        })]
      }))
    }))
  ]
}));

children.push(
  SPACER(420),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'College of Applied Studies', font: SERIF, size: 22 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 40 },
    children: [new TextRun({ text: 'Program of Natural Sciences and Engineering', font: SERIF, size: 22 })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 0 },
    children: [new TextRun({ text: 'CT1552 — 1447 (1)', font: SERIF, size: 22, bold: true })]
  }),
  BREAK()
);

/* ---------- FIRST ---------- */
children.push(
  H1('First: Project Function'),
  P('The project is a small web application for keeping a directory of contacts. Each contact consists of a name and a mobile number, and the user can view the whole directory, add a new contact, change the details of an existing one, or remove one entirely.'),
  P('All records are stored in a PostgreSQL database hosted on Supabase, so the data stays available after the browser is closed and is the same for anyone who opens the site.'),

  H2('Main Objectives'),
  BULLET('To display the stored contacts in a clear table.'),
  BULLET('To allow a new contact to be added through a simple form.'),
  BULLET('To allow the details of an existing contact to be changed.'),
  BULLET('To allow a contact to be deleted from the directory.'),
  BULLET('To keep all of this connected to a real backend database.'),

  H2('How the Application Works'),
  NUM('The user opens the main page, which reads the contacts from the database and shows them in a table.'),
  NUM('Choosing "add" opens a form with two fields, and saving it inserts a new row into the database.'),
  NUM('Choosing "edit" next to a contact opens the same two fields already filled with that contact’s details, and saving updates the row.'),
  NUM('Choosing "delete" asks for confirmation and then removes the row from the database.'),
  NUM('After every operation the table is read again, so the page always shows the current data.'),

  H2('Types of Data Handled'),
  SPACER(60),
  TABLE(
    ['Field', 'Description', 'Type'],
    [
      ['id', 'Record number, generated automatically by the database', 'BIGINT'],
      ['name', 'The name of the contact', 'TEXT'],
      ['phone', 'The mobile number of the contact', 'TEXT'],
      ['created_at', 'The date the contact was added', 'TIMESTAMPTZ']
    ],
    [1700, 5400, 2214]
  ),
  SPACER(140),

  H2('Nature of the Application'),
  P('The application is an online one. The records are not kept inside the browser but in a database on a server, so the same directory appears on any device that opens the site and the data is not lost if the browser is cleared.'),
  BREAK()
);

/* ---------- SECOND ---------- */
children.push(
  H1('Second: Application Pages and Their Functions'),
  P('The application consists of three pages, each with a single clear purpose. A small menu at the top of every page moves between them.'),

  H2('1. Display Page (index.html)'),
  P('This is the main page. It reads all the contacts from the database and shows them in a table containing the record number, the name and the mobile number. Next to every row there are two controls: a link that opens the edit page for that contact, and a button that deletes it.'),
  FIG('1-list.jpg', 440, 1480, 790),
  CAP('Figure 1 — The display page listing the stored contacts'),

  H2('2. Add Page (add.html)'),
  P('This page contains the form used to add a new contact. It has two fields, the name and the mobile number, and a save button. The two fields are required, and a message appears on the page to confirm the addition or to report a problem.'),
  FIG('2-add.jpg', 400, 1480, 650),
  CAP('Figure 2 — The add form before saving'),
  FIG('3-add-done.jpg', 400, 1480, 748),
  CAP('Figure 3 — The confirmation message after the contact has been saved'),

  P('Returning to the display page shows the new contact at the end of the table, which confirms that the record was written to the database and not only to the screen.'),
  FIG('4-after-add.jpg', 440, 1480, 892),
  CAP('Figure 4 — The directory after adding a new contact'),

  H2('3. Edit Page (edit.html)'),
  P('The edit page receives the record number through the address of the page, reads that contact from the database, and fills the two fields with its current details. Changing a field and saving updates the row in the database.'),
  FIG('5-edit.jpg', 400, 1480, 650),
  CAP('Figure 5 — The edit form with the mobile number being changed'),
  FIG('6-edit-done.jpg', 400, 1480, 748),
  CAP('Figure 6 — The confirmation message after the update'),

  P('The change is visible immediately on the display page, where the mobile number of the edited contact now shows the new value.'),
  FIG('7-after-edit.jpg', 440, 1480, 892),
  CAP('Figure 7 — The directory after the update'),

  H2('4. Deleting a Contact'),
  P('Deleting is carried out from the display page. Pressing the delete button next to a contact asks for confirmation first, and only then is the row removed from the database and the table read again.'),
  FIG('8-after-delete.jpg', 440, 1480, 888),
  CAP('Figure 8 — The directory after the contact has been deleted')
);

/* ---------- THIRD ---------- */
children.push(
  H1('Third: The Database'),
  P('The application is connected to a PostgreSQL database hosted on Supabase. It contains one table, named contacts, which holds every record the application works with.'),
  FIG('9-db-schema.jpg', 540, 2200, 716),
  CAP('Figure 9 — The structure of the contacts table'),

  H2('Creating the Table'),
  P('The table was created with the following statement:'),
  CODE([
    'CREATE TABLE contacts (',
    '  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,',
    '  name       TEXT NOT NULL,',
    '  phone      TEXT NOT NULL,',
    '  created_at TIMESTAMPTZ DEFAULT NOW()',
    ');'
  ]),
  P('The id column is the primary key and is generated automatically, so every contact receives its own number without the user having to enter one. The name and phone columns are marked NOT NULL, which means the database itself refuses an empty record even if the form were bypassed.'),
  BREAK(),

  H2('Stored Data'),
  P('The following rows were read directly from the database and show the contacts that the application is working with.'),
  FIG('10-db-data.jpg', 540, 2200, 674),
  CAP('Figure 10 — The rows stored in the contacts table'),

  H2('Connecting to the Database'),
  P('The connection is made over HTTPS using the interface that Supabase provides for the table. A single small file holds the address, the key and the five functions the pages need, and each page calls the function it requires.'),
  CODE([
    "const URL = 'https://pvyxlnjnbicnwwmugfca.supabase.co/rest/v1/contacts';",
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
  ]),
  BREAK()
);

/* ---------- FOURTH ---------- */
children.push(
  H1('Fourth: Data Manipulation'),
  P('The project requires the website to display, add and update records through a form interface, and to allow records to be deleted. The application performs all four operations on the contacts table.'),
  SPACER(60),
  TABLE(
    ['Operation', 'Page', 'Method', 'What it does'],
    [
      ['Display', 'index.html, edit.html', 'GET', 'Reads the contacts and shows them'],
      ['Add', 'add.html', 'POST', 'Inserts a new contact'],
      ['Update', 'edit.html', 'PATCH', 'Changes an existing contact'],
      ['Delete', 'index.html', 'DELETE', 'Removes a contact']
    ],
    [1500, 2700, 1200, 3914]
  ),
  SPACER(160),

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
  BREAK()
);

/* ---------- FIFTH ---------- */
children.push(
  H1('Fifth: Data Validation'),
  P('Validation is applied in three places, so that an incomplete record cannot reach the database.'),

  H2('In the browser'),
  P('Both fields carry the required attribute, so the browser itself refuses to submit the form while either of them is empty.'),

  H2('In the page code'),
  P('Before the record is sent, the values are trimmed and checked again. If either is empty the request is not made and a message is shown on the page instead.'),
  CODE([
    "if (name === '' || phone === '') {",
    "  msg.textContent = 'الرجاء تعبئة جميع الحقول';",
    "  msg.className = 'msg show';",
    '  return;',
    '}'
  ]),

  H2('In the database'),
  P('The name and phone columns are declared NOT NULL, so the database refuses an empty value regardless of which page sent it. Deleting also asks the user to confirm before the record is removed, so a record cannot be lost by a single accidental press.'),
  SPACER(140),

  H1('Sixth: Project Files'),
  P('The project is written in plain HTML, CSS and JavaScript and needs no additional programs to run.'),
  SPACER(60),
  TABLE(
    ['File', 'Function'],
    [
      ['index.html', 'The display page, and the place where deleting is carried out'],
      ['add.html', 'The form for adding a new contact'],
      ['edit.html', 'The form for changing an existing contact'],
      ['style.css', 'The appearance of the three pages'],
      ['db.js', 'The connection to the database and the five functions the pages use']
    ],
    [2400, 6914]
  ),
  BREAK()
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
       'index.html displays the contacts, add.html adds a new one, and edit.html updates an existing one'],
      ['A reliable connection with a backend database',
       'A PostgreSQL database on Supabase holding the contacts table, reached over HTTPS'],
      ['A user-friendly form interface to add, edit and delete records',
       'The add and edit forms, and the delete button with its confirmation, all validated before the record is sent']
    ],
    [3000, 6314]
  ),
  SPACER(200),

  H2('Closing Note'),
  P('The application covers the full set of operations on stored data through a small and readable set of files. The directory is deliberately simple, with one table and two fields, so that the connection with the database and the four operations performed on it can be followed clearly from end to end.'),
  SPACER(260),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: INK, space: 10 } },
    spacing: { before: 200 },
    children: [new TextRun({
      text: 'Contacts Directory  ·  CT1552', font: SERIF, size: 20, color: GREY
    })]
  })
);

/* ================= DOCUMENT ================= */
const doc = new Document({
  creator: 'CT1552 Project Team',
  title: 'Contacts Directory — CT1552 Project Report',
  numbering: {
    config: [
      {
        reference: 'dots',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 520, hanging: 260 } }, run: { font: SERIF, size: 22 } }
        }]
      },
      {
        reference: 'steps',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 520, hanging: 260 } }, run: { font: SERIF, size: 22 } }
        }]
      }
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
          children: [new TextRun({
            children: ['— ', PageNumber.CURRENT, ' —'], font: SERIF, size: 18, color: GREY
          })]
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
