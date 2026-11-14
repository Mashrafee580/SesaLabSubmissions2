import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderService } from '../services/orderService';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { money } from '../utils/money';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const schema = z.object({
  name: z.string().trim().min(1, 'Required'),
  email: z.string().trim().min(1, 'Required'),
  phone: z.string().trim().min(1, 'Required'),
  address: z.string().trim().min(1, 'Required'),
  city: z.string().trim().min(1, 'Required'),
  zip: z.string().trim().min(1, 'Required'),
  payMethod: z.enum(['card', 'cod']),
  holder: z.string().optional(),
  number: z.string().optional(),
  expiry: z.string().optional(),
  cvv: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.payMethod !== 'card') return;
  if (!data.holder?.trim()) ctx.addIssue({ code: 'custom', path: ['holder'], message: 'Required' });
  if (!/^\d{16}$/.test((data.number || '').replace(/\s/g, ''))) ctx.addIssue({ code: 'custom', path: ['number'], message: 'Enter valid 16-digit card number' });
  if (!/^\d{2}\/\d{2}$/.test(data.expiry || '')) ctx.addIssue({ code: 'custom', path: ['expiry'], message: 'Use MM/YY format' });
  if (!/^\d{3,4}$/.test(data.cvv || '')) ctx.addIssue({ code: 'custom', path: ['cvv'], message: 'Enter valid CVV' });
});

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
];

export default function CheckoutPage() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { items, deliveryOption, getSubtotal, getTotal, clearCart } = useCartStore();
  const showToast = useToastStore((s) => s.show);
  const [loading, setLoading] = useState(false);
  const [guestOrder, setGuestOrder] = useState(null);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address?.street || '',
      city: user?.address?.city || '',
      zip: user?.address?.zip || '',
      payMethod: 'card',
      holder: '',
      number: '',
      expiry: '',
      cvv: '',
    },
  });
  const payMethod = watch('payMethod');

  if (!items.length && !guestOrder) {
    return <p className="py-16 text-center">Your cart is empty. <button type="button" className="text-accent underline" onClick={() => navigate('/books')}>Browse books</button></p>;
  }

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({ book: i._id, qty: i.qty }));
      const res = await orderService.createOrder(
        orderItems,
        { name: values.name, email: values.email, phone: values.phone, address: values.address, city: values.city, zip: values.zip },
        { type: deliveryOption.id, cost: deliveryOption.price }
      );
      if (res.success) {
        clearCart();
        showToast('Order placed successfully! 🎉', 'success');
        if (isAuthenticated) navigate(`/orders/${res.data._id}`, { replace: true });
        else setGuestOrder(res.data);
      } else showToast(res.message || 'Order failed', 'error');
    } catch (err) {
      showToast(err.message || 'Order failed', 'error');
    }
    setLoading(false);
  };

  if (guestOrder) {
    return (
      <div className="mx-auto max-w-lg rounded-xl bg-green-100 p-8 text-center">
        <p className="text-4xl">🎉</p>
        <h1 className="mt-2 text-xxl font-extrabold text-success">Order Placed!</h1>
        <p className="mt-2 font-semibold text-muted">{guestOrder.orderNumber}</p>
        <p className="mt-2 text-sm text-muted">Total {money(guestOrder.total)}. Sign in with the same email on a future order to track it in your account.</p>
        <Button title="Continue Shopping" className="mt-6" onClick={() => navigate('/')} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <section className="rounded-xl bg-card p-4 shadow-sm">
          <h1 className="mb-4 text-lg font-bold">📦 Shipping Details</h1>
          {!isAuthenticated && <p className="mb-3 text-sm text-muted">Checking out as a guest. You can also <button type="button" className="font-semibold text-accent" onClick={() => navigate('/auth/login', { state: { from: '/checkout' } })}>sign in</button>.</p>}
          <Input label="Full Name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Phone Number" {...register('phone')} error={errors.phone?.message} />
          <Input label="Street Address" {...register('address')} error={errors.address?.message} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="City" {...register('city')} error={errors.city?.message} />
            <Input label="ZIP Code" {...register('zip')} error={errors.zip?.message} />
          </div>
        </section>
        <section className="rounded-xl bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold">💳 Payment Method</h2>
          {PAYMENT_METHODS.map((m) => (
            <button key={m.id} type="button" onClick={() => setValue('payMethod', m.id)} className={`mb-2 flex w-full items-center rounded-md border-[1.5px] p-3.5 ${payMethod === m.id ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <span className="mr-2">{m.icon}</span>
              <span className="font-medium">{m.label}</span>
            </button>
          ))}
          {payMethod === 'card' && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="mb-3 rounded-sm bg-yellow-100 p-2.5 text-center text-xs text-amber-800">🔒 Mock Payment — No real charges</p>
              <Input label="Cardholder Name" {...register('holder')} error={errors.holder?.message} />
              <Input
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                {...register('number')}
                error={errors.number?.message}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 16);
                  setValue('number', cleaned.replace(/(.{4})/g, '$1 ').trim(), { shouldValidate: true });
                }}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Expiry"
                  placeholder="MM/YY"
                  {...register('expiry')}
                  error={errors.expiry?.message}
                  onChange={(e) => {
                    let c = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (c.length >= 3) c = `${c.slice(0, 2)}/${c.slice(2)}`;
                    setValue('expiry', c, { shouldValidate: true });
                  }}
                />
                <Input label="CVV" type="password" {...register('cvv')} error={errors.cvv?.message} onChange={(e) => setValue('cvv', e.target.value.replace(/\D/g, '').slice(0, 4), { shouldValidate: true })} />
              </div>
            </div>
          )}
        </section>
      </div>
      <section className="h-fit rounded-xl bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold">🧾 Order Summary</h2>
        {items.map((item) => (
          <div key={item._id} className="flex justify-between py-1.5 text-sm">
            <span className="mr-3 truncate">{item.title} ×{item.qty}</span>
            <span className="font-semibold">{money(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="my-2 h-px bg-border" />
        <div className="flex justify-between py-1 text-sm text-muted"><span>Subtotal</span><span>{money(getSubtotal())}</span></div>
        <div className="flex justify-between py-1 text-sm text-muted"><span>Delivery ({deliveryOption.label})</span><span>{deliveryOption.price === 0 ? 'Free' : money(deliveryOption.price)}</span></div>
        <div className="mt-2 flex justify-between"><span className="text-lg font-bold">Total</span><span className="text-xl font-extrabold text-accent">{money(getTotal())}</span></div>
        <Button title={`Place Order — ${money(getTotal())}`} type="submit" loading={loading} fullWidth size="lg" className="mt-4" />
      </section>
    </form>
  );
}
