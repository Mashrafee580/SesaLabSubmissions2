import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { money } from '../utils/money';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  useDocumentTitle('Order');
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    orderService.getOrder(id)
      .then((r) => { if (r.success) setOrder(r.data); else setError('Order not found'); })
      .catch((err) => setError(err.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="py-16 text-center text-muted">Loading order…</p>;
  if (!order) return <p className="py-16 text-center">{error || 'Order not found'}</p>;

  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-xl bg-green-100 p-8 text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="text-xxl font-extrabold text-success">Order Placed!</h1>
        <p className="font-semibold text-muted">{order.orderNumber}</p>
      </div>
      {order.status !== 'cancelled' ? (
        <section className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="mb-4 font-bold">Order Status</h2>
          <ol className="grid grid-cols-4 gap-2">
            {STATUS_STEPS.map((s, i) => (
              <li key={s} className="text-center">
                <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${i <= stepIdx ? 'bg-success' : 'bg-border'}`}>{i <= stepIdx ? '✓' : ''}</div>
                <p className={`mt-1 text-[10px] capitalize ${i <= stepIdx ? 'font-semibold text-success' : 'text-muted'}`}>{s}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <p className="rounded-lg bg-red-100 p-4 text-center font-semibold text-error">❌ This order was cancelled</p>
      )}
      <section className="rounded-xl bg-card p-4 shadow-sm">
        <h2 className="mb-2 font-bold">Items Ordered</h2>
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between border-b border-border py-2 text-sm">
            <span>{item.title}</span>
            <span>×{item.qty} · <strong>{money(item.price * item.qty)}</strong></span>
          </div>
        ))}
      </section>
      <section className="rounded-xl bg-card p-4 shadow-sm">
        <h2 className="mb-2 font-bold">Shipping Details</h2>
        <p className="text-sm text-textSecondary">{order.shipping?.name}</p>
        <p className="text-sm text-textSecondary">{order.shipping?.address}, {order.shipping?.city} {order.shipping?.zip}</p>
        <p className="text-sm text-textSecondary">{order.shipping?.email}</p>
        <p className="text-sm text-textSecondary">{order.shipping?.phone}</p>
      </section>
      <section className="rounded-xl bg-card p-4 shadow-sm">
        <h2 className="mb-2 font-bold">Payment Summary</h2>
        <div className="flex justify-between border-b border-border py-2 text-sm"><span className="text-muted">Subtotal</span><span>{money(order.subtotal)}</span></div>
        <div className="flex justify-between border-b border-border py-2 text-sm"><span className="text-muted">Delivery ({order.delivery?.type})</span><span>{order.delivery?.cost === 0 ? 'Free' : money(order.delivery?.cost)}</span></div>
        <div className="flex justify-between pt-3"><span className="text-lg font-bold">Total</span><span className="text-xl font-extrabold text-accent">{money(order.total)}</span></div>
      </section>
      <Link to="/" className="block rounded-full bg-primary py-4 text-center font-bold text-white">Continue Shopping →</Link>
    </div>
  );
}
