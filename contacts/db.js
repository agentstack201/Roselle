/* الاتصال بقاعدة البيانات */

const URL = 'https://pvyxlnjnbicnwwmugfca.supabase.co/rest/v1/contacts';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eXhsbmpuYmljbnd3bXVnZmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NDk3MjUsImV4cCI6MjEwOTMyNTcyNX0.TqCeOe3AymeKSR8G4lCkgmN9kmdsV8jvrj0McPz-GMA';

const HEAD = {
  'apikey': KEY,
  'Authorization': 'Bearer ' + KEY,
  'Content-Type': 'application/json'
};

/* عرض جميع جهات الاتصال */
async function getAll() {
  const res = await fetch(URL + '?select=*&order=id.asc', { headers: HEAD });
  return res.json();
}

/* عرض جهة اتصال واحدة */
async function getOne(id) {
  const res = await fetch(URL + '?id=eq.' + id, { headers: HEAD });
  const rows = await res.json();
  return rows[0];
}

/* إضافة */
async function addContact(name, phone) {
  await fetch(URL, {
    method: 'POST',
    headers: HEAD,
    body: JSON.stringify({ name: name, phone: phone })
  });
}

/* تعديل */
async function updateContact(id, name, phone) {
  await fetch(URL + '?id=eq.' + id, {
    method: 'PATCH',
    headers: HEAD,
    body: JSON.stringify({ name: name, phone: phone })
  });
}

/* حذف */
async function deleteContact(id) {
  await fetch(URL + '?id=eq.' + id, {
    method: 'DELETE',
    headers: HEAD
  });
}
