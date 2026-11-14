import { useNavigate } from 'react-router-dom';
import { DELIVERY_OPTIONS } from '../constants/api';
import { useCartStore } from '../store/cartStore';
import Button from '../components/ui/Button';
import CoverImage from '../components/ui/CoverImage';
import EmptyState from '../components/ui/EmptyState';
import { money } from '../utils/money';
import { useDocumentTitle } from '../utils/useDocumentTitle';

export default function CartPage() {
  useDocumentTitle('Cart');
  const navigate = useNavigate();
  const { items, deliveryOption, updateQty, removeItem, clearCart, setDelivery, getSubtotal, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold">My Cart</h1>
        <EmptyState icon="🛒" title="Your cart is empty" subtitle="Browse our collection and add some books!" actionLabel="Browse Books" onAction={() => navigate('/books')} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-xl bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">My Cart</h1>
          <button type="button" className="text-sm text-accent" onClick={clearCart}>Clear All</button>
        </div>
        {items.map((item) => (
          <div key={item._id} className="mb-4 flex border-b border-border pb-4">
            <CoverImage src={item.coverUrl} alt={item.title} className="h-[100px] w-[70px] rounded-sm" />
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold">{item.title}</p>
              <p className="text-xs text-muted">{item.author}</p>
              <p className="my-1 font-bold text-accent">{money(item.price * item.qty)}</p>
              <div className="flex items-center">
                <button type="button" aria-label="Decrease" className="h-8 w-8 rounded-full border border-border bg-secondary" onClick={() => (item.qty > 1 ? updateQty(item._id, item.qty - 1) : removeItem(item._id))}>−</button>
                <span className="w-9 text-center font-bold">{item.qty}</span>
                <button type="button" aria-label="Increase" className="h-8 w-8 rounded-full border border-border bg-secondary" onClick={() => updateQty(item._id, Math.min(item.qty + 1, item.stock || 99))}>+</button>
              </div>
            </div>
            <button type="button" aria-label={`Remove ${item.title}`} className="px-2 text-muted" onClick={() => removeItem(item._id)}>✕</button>
          </div>
        ))}
      </section>
      <div className="space-y-4">
        <section className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">Delivery Options</h2>
          {DELIVERY_OPTIONS.map((opt) => {
            const active = deliveryOption.id === opt.id;
            return (
              <button key={opt.id} type="button" onClick={() => setDelivery(opt)} className={`mb-2 flex w-full items-center rounded-md border-[1.5px] p-3.5 text-left ${active ? 'border-primary bg-primary/5' : 'border-border'}`}>
                <span className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? 'border-primary' : 'border-muted'}`}>{active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}</span>
                <span className="flex-1">
                  <span className={`block text-sm font-semibold ${active ? 'text-primary' : ''}`}>{opt.label}</span>
                  <span className="text-xs text-muted">{opt.subtitle}</span>
                </span>
                <span className={`text-sm font-bold ${active ? 'text-accent' : ''}`}>{opt.price === 0 ? 'Free' : money(opt.price)}</span>
              </button>
            );
          })}
        </section>
        <section className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-bold">Order Summary</h2>
          <div className="flex justify-between border-b border-border py-2 text-md"><span className="text-muted">Subtotal</span><span>{money(getSubtotal())}</span></div>
          <div className="flex justify-between border-b border-border py-2 text-md"><span className="text-muted">Delivery</span><span>{deliveryOption.price === 0 ? 'Free' : money(deliveryOption.price)}</span></div>
          <div className="flex justify-between py-3"><span className="text-lg font-bold">Total</span><span className="text-xl font-extrabold text-accent">{money(getTotal())}</span></div>
          <Button title="Proceed to Checkout" size="lg" fullWidth onClick={() => navigate('/checkout')} />
        </section>
      </div>
    </div>
  );
}
