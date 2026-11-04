/* الاتصال بقاعدة البيانات على Supabase */

const DB_URL = 'https://pvyxlnjnbicnwwmugfca.supabase.co/rest/v1/countries';
const DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eXhsbmpuYmljbnd3bXVnZmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NDk3MjUsImV4cCI6MjEwOTMyNTcyNX0.TqCeOe3AymeKSR8G4lCkgmN9kmdsV8jvrj0McPz-GMA';

const HEADERS = {
  'apikey': DB_KEY,
  'Authorization': 'Bearer ' + DB_KEY,
  'Content-Type': 'application/json'
};

/* عرض: جلب جميع الدول */
async function getCountries() {
  const res = await fetch(DB_URL + '?select=*&order=id.asc', { headers: HEADERS });
  if (!res.ok) throw new Error('فشل جلب البيانات');
  return res.json();
}

/* عرض: جلب دولة واحدة */
async function getCountry(id) {
  const res = await fetch(DB_URL + '?id=eq.' + id, { headers: HEADERS });
  if (!res.ok) throw new Error('فشل جلب البيانات');
  const rows = await res.json();
  return rows[0];
}

/* إضافة */
async function addCountry(data) {
  const res = await fetch(DB_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('فشل حفظ البيانات');
}

/* تعديل */
async function updateCountry(id, data) {
  const res = await fetch(DB_URL + '?id=eq.' + id, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('فشل تعديل البيانات');
}

/* حذف */
async function deleteCountry(id) {
  const res = await fetch(DB_URL + '?id=eq.' + id, {
    method: 'DELETE',
    headers: HEADERS
  });
  if (!res.ok) throw new Error('فشل حذف البيانات');
}
