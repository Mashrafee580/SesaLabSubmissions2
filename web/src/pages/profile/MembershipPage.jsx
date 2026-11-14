import { useState } from 'react';
import { membershipService } from '../../services/membershipService';
import { PLAN_FEATURES } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/Modal';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

const gradients = {
  free: 'from-gray-500 to-gray-400',
  premium: 'from-primary to-primaryLight',
  ultimate: 'from-accent to-accentLight',
};

export default function MembershipPage() {
  useDocumentTitle('Membership');
  const { user, refreshUser } = useAuthStore();
  const showToast = useToastStore((s) => s.show);
  const [loading, setLoading] = useState(null);
  const [pending, setPending] = useState(null);

  const doSubscribe = async (plan) => {
    setLoading(plan);
    try {
      const res = await membershipService.subscribe(plan);
      if (res.success) {
        await refreshUser();
        showToast(`Subscribed to ${plan} plan! 🎉`, 'success');
      } else showToast(res.message || 'Subscription failed', 'error');
    } catch (err) {
      showToast(err.message || 'Subscription failed', 'error');
    }
    setLoading(null);
    setPending(null);
  };

  const choose = (plan) => {
    if (plan === user?.plan) { showToast('You are already on this plan', 'info'); return; }
    if (plan !== 'free') setPending(plan);
    else doSubscribe(plan);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-center text-xxl font-extrabold">Choose Your Plan</h1>
      <p className="mb-6 text-center text-muted">Unlock exclusive benefits and save more on every purchase</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {['free', 'premium', 'ultimate'].map((planKey) => {
          const p = PLAN_FEATURES[planKey];
          const isCurrent = user?.plan === planKey;
          return (
            <article key={planKey} className={`overflow-hidden rounded-xl bg-card shadow-md ${isCurrent ? 'border-2 border-accent' : ''}`}>
              <div className={`relative bg-gradient-to-br p-6 text-white ${gradients[planKey]}`}>
                {planKey === 'premium' && <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-1 text-xs font-bold">Most Popular</span>}
                <p className="text-lg font-bold">{p.name}</p>
                <p className="text-4xl font-extrabold">${p.price}<span className="text-sm font-medium text-white/75">/month</span></p>
              </div>
              <div className="p-5">
                {p.features.map((f) => (
                  <p key={f} className="mb-2 flex items-center text-sm"><span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-success">✓</span>{f}</p>
                ))}
                <Button
                  title={isCurrent ? 'Current Plan' : `Choose ${p.name}`}
                  onClick={() => choose(planKey)}
                  loading={loading === planKey}
                  disabled={isCurrent}
                  variant={isCurrent ? 'secondary' : planKey === 'ultimate' ? 'accent' : 'primary'}
                  fullWidth
                  className="mt-4"
                />
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted">🔒 Secure · Cancel anytime · No hidden fees</p>
      <ConfirmModal
        visible={!!pending}
        title="Confirm Subscription"
        message={pending ? `Subscribe to ${PLAN_FEATURES[pending].name} for $${PLAN_FEATURES[pending].price}/month? (Mock payment — no real charge)` : ''}
        confirmLabel="Subscribe"
        onClose={() => setPending(null)}
        onConfirm={() => doSubscribe(pending)}
      />
    </div>
  );
}
