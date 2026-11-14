import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/Modal';
import { money } from '../../utils/money';
import { useDocumentTitle } from '../../utils/useDocumentTitle';
import BooksManager from './BooksManager';

const TABS = ['Dashboard', 'Users', 'Orders', 'Marketplace', 'Books', 'Memberships', 'Messages'];

export default function AdminPage() {
  useDocumentTitle('Admin');
  const [searchParams] = useSearchParams();
  const me = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const [tab, setTab] = useState(() => {
    const requestedTab = searchParams.get('tab');
    if (TABS.includes(requestedTab)) return requestedTab;
    return searchParams.has('new') || searchParams.has('edit') ? 'Books' : 'Dashboard';
  });
  const [bookRequest] = useState(() => {
    if (searchParams.get('new') === '1') return { type: 'new' };
    const id = searchParams.get('edit');
    return id ? { type: 'edit', id } : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [messages, setMessages] = useState([]);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirm, setConfirm] = useState(null);

  const loadTab = async (name = tab) => {
    setLoading(true);
    setError('');
    try {
      if (name === 'Dashboard') {
        const r = await adminService.getStats();
        if (r.success) setStats(r.data);
      } else if (name === 'Users') {
        const r = await adminService.getUsers();
        if (r.success) setUsers(r.data);
      } else if (name === 'Orders') {
        const r = await adminService.getAllOrders();
        if (r.success) setOrders(r.data);
      } else if (name === 'Marketplace') {
        const r = await adminService.getAllListings();
        if (r.success) setListings(r.data);
      } else if (name === 'Memberships') {
        const r = await adminService.getMemberships();
        if (r.success) setMemberships(r.data);
      } else if (name === 'Messages') {
        const r = await adminService.getMessages();
        if (r.success) setMessages(r.data);
      }
    } catch (err) {
      setError(err.message || 'Could not load admin data');
    }
    setLoading(false);
  };

  useEffect(() => { if (tab !== 'Books') loadTab(tab); }, [tab]);

  const approve = async (id) => {
    try {
      const r = await adminService.approveListing(id);
      if (r.success) { showToast('Listing approved!', 'success'); loadTab(); }
      else showToast(r.message || 'Failed', 'error');
    } catch (err) { showToast(err.message || 'Failed', 'error'); }
  };

  const reject = async (id) => {
    try {
      const r = await adminService.rejectListing(id, rejectReason);
      if (r.success) { showToast('Listing rejected', 'info'); setRejectId(null); setRejectReason(''); loadTab(); }
      else showToast(r.message || 'Failed', 'error');
    } catch (err) { showToast(err.message || 'Failed', 'error'); }
  };

  const setStatus = async (id, status) => {
    try {
      const r = await adminService.updateOrderStatus(id, status);
      if (r.success) { showToast('Order status updated', 'success'); loadTab(); }
    } catch (err) { showToast(err.message || 'Failed', 'error'); }
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Admin Panel</h1>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2" role="tablist">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === t ? 'bg-primary text-white' : 'bg-secondary text-muted'}`}>{t}</button>
        ))}
      </div>
      {error && <p className="my-3 text-sm text-error">{error} <button type="button" className="underline" onClick={() => loadTab()}>Retry</button></p>}
      {loading && <p className="py-10 text-center text-muted">Loading…</p>}

      {!loading && tab === 'Dashboard' && stats && (
        <div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {[
              ['Total Users', stats.users, '👥'],
              ['Total Books', stats.books, '📚'],
              ['Total Orders', stats.orders, '📦'],
              ['Listings', stats.listings, '🏪'],
              ['Pending', stats.pendingListings, '⏳'],
              ['Members', stats.paidMemberships, '💎'],
            ].map(([label, value, icon]) => (
              <div key={label} className="rounded-lg border-l-4 border-accent bg-card p-4 shadow-sm">
                <div className="text-2xl">{icon}</div>
                <p className="text-xxl font-extrabold">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-primary p-8 text-center text-white">
            <p className="text-sm text-white/70">Total Revenue</p>
            <p className="text-4xl font-extrabold">{money(stats.totalRevenue)}</p>
          </div>
          <h2 className="mb-2 mt-6 font-bold">Recent Orders</h2>
          {stats.recentOrders?.map((o) => (
            <div key={o._id} className="mb-2 flex items-center justify-between rounded-lg bg-card p-3 shadow-sm">
              <div>
                <p className="font-bold">{o.orderNumber}</p>
                <p className="text-xs text-muted">{o.user?.name || o.shipping?.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-accent">{money(o.total)}</p>
                <Badge label={o.status} preset={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'pending'} size="xs" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'Users' && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center gap-3 rounded-lg bg-card p-3 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-bold text-white">{u.name?.[0]?.toUpperCase()}</div>
              <div className="min-w-[180px] flex-1">
                <p className="font-bold">{u.name}</p>
                <p className="text-xs text-muted">{u.email}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge label={u.role} preset={u.role === 'admin' ? 'primary' : 'default'} size="xs" />
                  <Badge label={u.plan} preset={u.plan === 'ultimate' ? 'accent' : u.plan === 'premium' ? 'primary' : 'default'} size="xs" />
                  {u.isBlocked && <Badge label="Blocked" preset="error" size="xs" />}
                </div>
              </div>
              {u._id !== me?._id && (
                <div className="flex gap-2">
                  <button type="button" className="rounded-sm bg-secondary px-2.5 py-1.5 text-xs font-semibold" onClick={async () => {
                    const r = await adminService.toggleBlockUser(u._id);
                    if (r.success) { showToast(r.data.isBlocked ? 'User blocked' : 'User unblocked', 'info'); loadTab(); }
                  }}>{u.isBlocked ? 'Unblock' : 'Block'}</button>
                  <button type="button" className="rounded-sm border border-error px-2.5 py-1.5 text-xs font-semibold text-error" onClick={() => setConfirm({
                    title: 'Delete User',
                    message: `Delete ${u.name}?`,
                    danger: true,
                    run: async () => { await adminService.deleteUser(u._id); setConfirm(null); loadTab(); },
                  })}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'Orders' && (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o._id} className="rounded-lg bg-card p-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{o.orderNumber}</p>
                  <p className="text-xs text-muted">{o.shipping?.name} · {money(o.total)}</p>
                </div>
                <Badge label={o.status} preset={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'pending'} size="xs" />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {['confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(o._id, s)} className={`rounded-sm border px-2 py-1 text-[10px] font-semibold capitalize ${o.status === s ? 'border-success bg-success text-white' : 'border-border bg-secondary'}`}>{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'Marketplace' && (
        <div className="space-y-2">
          {listings.map((l) => (
            <article key={l._id} className="rounded-lg bg-card p-3 shadow-sm">
              <p className="font-bold">{l.title}</p>
              <p className="text-xs text-muted">{l.sellerName} · {money(l.price)}</p>
              <div className="mt-1 flex gap-1">
                <Badge label={l.status} preset={l.status === 'approved' ? 'approved' : l.status === 'rejected' ? 'rejected' : 'pending'} size="xs" />
                <Badge label={l.listingType} preset={l.listingType === 'sell' ? 'sell' : 'buy'} size="xs" />
              </div>
              {l.status === 'pending' && (
                <div className="mt-2 flex gap-2">
                  <button type="button" className="flex-1 rounded-sm bg-green-100 py-2 text-xs font-bold text-success" onClick={() => approve(l._id)}>✓ Approve</button>
                  <button type="button" className="flex-1 rounded-sm bg-red-100 py-2 text-xs font-bold text-error" onClick={() => setRejectId(l._id)}>✕ Reject</button>
                </div>
              )}
              {rejectId === l._id && (
                <div className="mt-2">
                  <Input placeholder="Rejection reason..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                  <button type="button" className="w-full rounded-sm bg-red-100 py-2 text-xs font-bold text-error" onClick={() => reject(l._id)}>Confirm Reject</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {!loading && tab === 'Books' && <BooksManager initialRequest={bookRequest} />}

      {!loading && tab === 'Memberships' && (
        <div className="space-y-2">
          {memberships.map((m) => (
            <div key={m._id} className="flex items-center justify-between rounded-lg bg-card p-3 shadow-sm">
              <div>
                <p className="font-bold">{m.user?.name}</p>
                <p className="text-xs text-muted">{m.user?.email}</p>
                <Badge label={m.plan} preset={m.plan === 'ultimate' ? 'accent' : m.plan === 'premium' ? 'primary' : 'default'} size="xs" className="mt-1" />
              </div>
              <p className="font-bold text-accent">{m.price === 0 ? 'Free' : `$${m.price}/mo`}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'Messages' && (
        <div className="space-y-2">
          {messages.map((m) => (
            <article key={m._id} className="rounded-lg bg-card p-3 shadow-sm">
              <p className="font-bold">{m.senderName}</p>
              <p className="text-xs text-muted">{m.listing?.title || 'Listing'}</p>
              <p className="mt-1 text-sm text-muted">{m.message}</p>
            </article>
          ))}
          {messages.length === 0 && <p className="text-sm text-muted">No messages yet.</p>}
        </div>
      )}

      <ConfirmModal
        visible={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel="Delete"
        danger={confirm?.danger}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.run}
      />
    </div>
  );
}
