import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { money } from '../../utils/money';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

export default function OrdersPage() {
  useDocumentTitle('My Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService.getMyOrders()
      .then((r) => { if (r.success) setOrders(r.data); })
      .catch((err) => setError(err.message || 'Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">My Orders</h1>
      {loading && <p className="text-muted">Loading…</p>}
      {error && <p className="text-error">{error}</p>}
      {!loading && orders.length === 0 && <EmptyState icon="📦" title="No Orders Yet" subtitle="Start shopping to see your orders here." actionLabel="Browse Books" onAction={() => { window.location.href = '/books'; }} />}
      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o._id} to={`/orders/${o._id}`} className="block rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold">{o.orderNumber}</span>
              <Badge label={o.status} preset={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'error' : 'pending'} />
            </div>
            <p className="my-1 text-sm text-muted">{o.items?.length} item{o.items?.length > 1 ? 's' : ''} · {o.delivery?.type} delivery</p>
            <div className="flex justify-between text-xs text-muted">
              <span>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="text-lg font-bold text-accent">{money(o.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
