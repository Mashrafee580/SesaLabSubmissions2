/**
 * API smoke test. Run while the server is up: node utils/smokeTest.js
 * Prints a pass/fail table. Does not print tokens or environment secrets.
 */
const BASE = 'http://localhost:4000/api';

const results = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function req(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

async function uploadCover(file, token, includeFile = true) {
  const formData = new FormData();
  if (includeFile) formData.append('cover', file, 'smoke-cover.png');
  const res = await fetch(`${BASE}/admin/uploads/cover`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true, detail: '' });
    console.log(`PASS  ${name}`);
  } catch (err) {
    results.push({ name, ok: false, detail: err.message });
    console.log(`FAIL  ${name} — ${err.message}`);
  }
}

const email = `smoke.${Date.now()}@papertrail.test`;
const password = 'smoke123';
let userToken = '';
let adminToken = '';
let book = null;
let createdListing = null;
let createdAdminBook = null;

await check('GET /health', async () => {
  const { status, data } = await req('/health');
  assert(status === 200 && data?.data?.status === 'ok', `status ${status}`);
});

await check('POST /auth/register', async () => {
  const { status, data } = await req('/auth/register', { method: 'POST', body: { name: 'Smoke Tester', email, password } });
  assert(status === 201 && data?.success && data.data?.token, data?.message || `status ${status}`);
  userToken = data.data.token;
});

await check('POST /auth/login user', async () => {
  const { status, data } = await req('/auth/login', { method: 'POST', body: { email, password } });
  assert(status === 200 && data?.data?.user?.role === 'user', data?.message || `status ${status}`);
  userToken = data.data.token;
});

await check('POST /auth/login admin', async () => {
  const { status, data } = await req('/auth/login', { method: 'POST', body: { email: 'admin@papertrail.com', password: 'admin123' } });
  assert(status === 200 && data?.data?.user?.role === 'admin', data?.message || `status ${status}`);
  adminToken = data.data.token;
});

await check('admin creates book with computed discount and PNG cover', async () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/V7sAAAAASUVORK5CYII=', 'base64');
  const cover = await uploadCover(new Blob([png], { type: 'image/png' }), adminToken);
  assert(cover.status === 200 && cover.data?.success && cover.data.data?.url?.includes('/uploads/covers/'), cover.data?.message || `upload status ${cover.status}`);

  const title = `Smoke Book ${Date.now()}`;
  const created = await req('/admin/books', {
    method: 'POST',
    token: adminToken,
    body: {
      title,
      author: 'Smoke Tester',
      genre: 'Fiction',
      price: 10,
      originalPrice: 20,
      stock: 3,
      coverUrl: cover.data.data.url,
      rating: 4.5,
      reviewCount: 123,
      discount: 1,
    },
  });
  assert(created.status === 201 && created.data?.success, created.data?.message || `status ${created.status}`);
  createdAdminBook = created.data.data;
  assert(createdAdminBook.discount === 50, `discount ${createdAdminBook.discount} expected 50`);
  assert(createdAdminBook.rating === 0 && createdAdminBook.reviewCount === 0, 'client rating fields were applied');
  assert(createdAdminBook.coverUrl === cover.data.data.url, 'cover URL missing from book');
});

await check('admin book is public and update recomputes discount', async () => {
  assert(createdAdminBook?._id, 'admin book was not created');
  const list = await req(`/books?search=${encodeURIComponent(createdAdminBook.title)}`);
  assert(list.status === 200 && list.data.data.some((item) => item._id === createdAdminBook._id), 'book missing from list');
  const detail = await req(`/books/${createdAdminBook._id}`);
  assert(detail.status === 200 && detail.data.data.coverUrl === createdAdminBook.coverUrl, 'book detail missing cover');

  const updated = await req(`/admin/books/${createdAdminBook._id}`, {
    method: 'PATCH',
    token: adminToken,
    body: { price: 8, originalPrice: 20, rating: 5, reviewCount: 456, discount: 2 },
  });
  assert(updated.status === 200 && updated.data?.success, updated.data?.message || `status ${updated.status}`);
  assert(updated.data.data.discount === 60, `discount ${updated.data.data.discount} expected 60`);
  assert(updated.data.data.rating === 0 && updated.data.data.reviewCount === 0, 'client rating fields were applied');
});

await check('admin book rejects invalid price, stock, and title', async () => {
  const base = { author: 'Smoke Tester', genre: 'Fiction', price: 10, stock: 1 };
  for (const [label, invalid] of [
    ['price', { price: -1 }],
    ['stock', { stock: 1.5 }],
    ['title', { title: '   ' }],
  ]) {
    const response = await req('/admin/books', {
      method: 'POST',
      token: adminToken,
      body: { ...base, title: 'Invalid Smoke Book', ...invalid },
    });
    assert(response.status === 400 && response.data?.success === false && response.data?.message, `${label} -> ${response.status}`);
  }
  if (createdAdminBook?._id) {
    for (const [label, invalid] of [
      ['updated price', { price: -1 }],
      ['updated stock', { stock: 1.5 }],
      ['updated title', { title: '   ' }],
      ['original price', { originalPrice: 1 }],
    ]) {
      const response = await req(`/admin/books/${createdAdminBook._id}`, {
        method: 'PATCH',
        token: adminToken,
        body: invalid,
      });
      assert(response.status === 400 && response.data?.success === false && response.data?.message, `${label} -> ${response.status}`);
    }
  }
});

await check('cover upload rejects non-image and missing file', async () => {
  const expectedErrorKeys = ['message', 'success'];
  const invalidType = await uploadCover(new Blob(['not an image'], { type: 'text/plain' }), adminToken);
  assert(
    invalidType.status === 400
      && invalidType.data?.success === false
      && invalidType.data?.message
      && Object.keys(invalidType.data).sort().join(',') === expectedErrorKeys.join(','),
    `non-image -> ${invalidType.status}`
  );
  const missingFile = await uploadCover(null, adminToken, false);
  assert(
    missingFile.status === 400
      && missingFile.data?.success === false
      && missingFile.data?.message
      && Object.keys(missingFile.data).sort().join(',') === expectedErrorKeys.join(','),
    `missing file -> ${missingFile.status}`
  );
  const oversized = await uploadCover(new Blob([Buffer.alloc((5 * 1024 * 1024) + 1)], { type: 'image/png' }), adminToken);
  assert(
    oversized.status === 400
      && oversized.data?.success === false
      && oversized.data?.message
      && Object.keys(oversized.data).sort().join(',') === expectedErrorKeys.join(','),
    `oversized image -> ${oversized.status}`
  );
});

await check('admin book and upload endpoints enforce roles', async () => {
  for (const path of ['/admin/books', '/admin/uploads/cover']) {
    const unauthenticated = path.endsWith('cover')
      ? await uploadCover(new Blob(['x'], { type: 'image/png' }), '')
      : await req(path, { method: 'POST', body: {} });
    assert(unauthenticated.status === 401, `${path} unauthenticated -> ${unauthenticated.status}`);

    const nonAdmin = path.endsWith('cover')
      ? await uploadCover(new Blob(['x'], { type: 'image/png' }), userToken)
      : await req(path, { method: 'POST', token: userToken, body: {} });
    assert(nonAdmin.status === 403, `${path} non-admin -> ${nonAdmin.status}`);
  }
});

await check('admin deletes smoke book', async () => {
  if (!createdAdminBook?._id) return;
  const deleted = await req(`/admin/books/${createdAdminBook._id}`, { method: 'DELETE', token: adminToken });
  assert(deleted.status === 200 && deleted.data?.success, deleted.data?.message || `status ${deleted.status}`);
  createdAdminBook = null;
});

await check('GET /books', async () => {
  const { status, data } = await req('/books');
  assert(status === 200 && Array.isArray(data?.data) && data.data.length > 0, 'no books');
  book = data.data.find((b) => b.stock > 2) || data.data[0];
});

await check('GET /books/featured', async () => {
  const { data } = await req('/books/featured');
  assert(data?.success && Array.isArray(data.data), 'featured failed');
});

await check('GET /books/new-arrivals', async () => {
  const { data } = await req('/books/new-arrivals');
  assert(data?.success && Array.isArray(data.data), 'new arrivals failed');
});

await check('GET /books/best-sellers', async () => {
  const { data } = await req('/books/best-sellers');
  assert(data?.success && Array.isArray(data.data), 'best sellers failed');
});

await check('GET /books/genres', async () => {
  const { data } = await req('/books/genres');
  assert(data?.success && data.data.length > 0, 'no genres');
});

await check('GET /books/:id', async () => {
  const { status, data } = await req(`/books/${book._id}`);
  assert(status === 200 && data?.data?._id === book._id, 'book missing');
  book = data.data;
});

await check('cart add/update/remove/clear', async () => {
  let res = await req('/cart/add', { method: 'POST', token: userToken, body: { bookId: book._id, qty: 1 } });
  assert(res.data?.success, res.data?.message || 'add failed');
  res = await req('/cart/update', { method: 'PATCH', token: userToken, body: { bookId: book._id, qty: 2 } });
  assert(res.data?.success && res.data.data.items[0].qty === 2, 'update failed');
  res = await req(`/cart/${book._id}`, { method: 'DELETE', token: userToken });
  assert(res.data?.success, 'remove failed');
  res = await req('/cart/add', { method: 'POST', token: userToken, body: { bookId: book._id, qty: 1 } });
  assert(res.data?.success, 're-add failed');
  res = await req('/cart/clear', { method: 'DELETE', token: userToken });
  assert(res.data?.success, 'clear failed');
});

await check('wishlist toggle/check/my', async () => {
  let res = await req('/wishlist/toggle', { method: 'POST', token: userToken, body: { bookId: book._id } });
  assert(res.data?.success && res.data.added === true, 'toggle add failed');
  res = await req(`/wishlist/check/${book._id}`, { token: userToken });
  assert(res.data?.inWishlist === true, 'check failed');
  res = await req('/wishlist/my', { token: userToken });
  assert(res.data?.data?.books?.some((b) => b._id === book._id), 'wishlist missing book');
  res = await req('/wishlist/toggle', { method: 'POST', token: userToken, body: { bookId: book._id } });
  assert(res.data?.added === false, 'toggle remove failed');
});

await check('POST /orders stock decreases', async () => {
  const before = book.stock;
  const res = await req('/orders', {
    method: 'POST',
    token: userToken,
    body: {
      items: [{ book: book._id, qty: 1 }],
      shipping: { name: 'Smoke Tester', email, phone: '01700000000', address: '1 Test Road', city: 'Dhaka', zip: '1205' },
      delivery: { type: 'standard', cost: 3.99 },
    },
  });
  assert(res.status === 201 && res.data?.success, res.data?.message || `status ${res.status}`);
  const after = await req(`/books/${book._id}`);
  assert(after.data.data.stock === before - 1, `stock ${after.data.data.stock} expected ${before - 1}`);
  book = after.data.data;
});

await check('GET /orders/my', async () => {
  const { data } = await req('/orders/my', { token: userToken });
  assert(data?.success && data.data.length >= 1, 'no orders');
});

await check('marketplace pending hidden, approve, then reject', async () => {
  const created = await req('/marketplace', {
    method: 'POST',
    token: userToken,
    body: {
      title: `Smoke Listing ${Date.now()}`,
      author: 'Tester',
      condition: 'Good',
      price: 4.5,
      listingType: 'sell',
      category: 'Fiction',
      description: 'Smoke test listing',
    },
  });
  assert(created.status === 201 && created.data?.data?.status === 'pending', created.data?.message || 'create failed');
  createdListing = created.data.data;
  const hidden = await req(`/marketplace?search=${encodeURIComponent(createdListing.title)}`);
  assert(!hidden.data.data.some((l) => l._id === createdListing._id), 'pending listing is public');
  const approved = await req(`/admin/marketplace/${createdListing._id}/approve`, { method: 'PATCH', token: adminToken });
  assert(approved.data?.data?.status === 'approved', 'approve failed');
  const visible = await req(`/marketplace?search=${encodeURIComponent(createdListing.title)}`);
  assert(visible.data.data.some((l) => l._id === createdListing._id), 'approved listing missing');
  const rejected = await req(`/admin/marketplace/${createdListing._id}/reject`, {
    method: 'PATCH',
    token: adminToken,
    body: { reason: 'Smoke test rejection' },
  });
  assert(rejected.data?.data?.status === 'rejected' && rejected.data.data.rejectionReason === 'Smoke test rejection', 'reject failed');
});

await check('membership subscribe and /my', async () => {
  const sub = await req('/memberships', { method: 'POST', token: userToken, body: { plan: 'premium' } });
  assert(sub.data?.success && sub.data.data.plan === 'premium', sub.data?.message || 'subscribe failed');
  const mine = await req('/memberships/my', { token: userToken });
  assert(mine.data?.data?.plan === 'premium', 'membership mismatch');
});

await check('notifications /my and read-all', async () => {
  const list = await req('/notifications/my', { token: userToken });
  assert(list.data?.success && list.data.data.length > 0, 'no notifications');
  const read = await req('/notifications/read-all', { method: 'PATCH', token: userToken });
  assert(read.data?.success, 'read-all failed');
});

await check('review create and list', async () => {
  const created = await req('/reviews', { method: 'POST', token: userToken, body: { book: book._id, rating: 5, comment: 'Smoke review' } });
  assert(created.status === 201 && created.data?.success, created.data?.message || 'review failed');
  const list = await req(`/reviews/book/${book._id}`);
  assert(list.data.data.some((r) => r.comment === 'Smoke review'), 'review not listed');
});

await check('admin stats, users, orders, memberships, messages', async () => {
  for (const path of ['/admin/stats', '/admin/users', '/admin/orders', '/admin/memberships', '/admin/messages']) {
    const res = await req(path, { token: adminToken });
    assert(res.status === 200 && res.data?.success, `${path} -> ${res.status} ${res.data?.message || ''}`);
  }
});

await check('non-admin /admin/* is 403', async () => {
  const res = await req('/admin/stats', { token: userToken });
  assert(res.status === 403, `expected 403 got ${res.status}`);
});

const passed = results.filter((r) => r.ok).length;
console.log('\n| Check | Result |');
console.log('| --- | --- |');
for (const row of results) {
  console.log(`| ${row.name} | ${row.ok ? 'PASS' : `FAIL (${row.detail})`} |`);
}
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
