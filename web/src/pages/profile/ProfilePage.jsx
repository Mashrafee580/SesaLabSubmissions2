import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { PLAN_FEATURES } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

const planPreset = { free: 'default', premium: 'primary', ultimate: 'accent' };

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const showToast = useToastStore((s) => s.show);
  const [membership, setMembership] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/memberships/my').then((r) => { if (r.data.success) setMembership(r.data.data); }).catch(() => {});
    api.get('/notifications/my').then((r) => {
      if (r.data.success) setUnreadCount(r.data.data.filter((n) => !n.isRead).length);
    }).catch(() => {});
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-6xl">👤</p>
        <h1 className="mt-3 text-xxl font-bold">Sign in to your account</h1>
        <p className="mb-6 mt-2 text-muted">Access your orders, wishlist, and membership benefits</p>
        <Button title="Sign In" size="lg" fullWidth onClick={() => navigate('/auth/login')} />
        <Button title="Create Account" variant="outline" size="lg" fullWidth className="mt-3" onClick={() => navigate('/auth/register')} />
      </div>
    );
  }

  const plan = membership?.plan || user?.plan || 'free';
  const planInfo = PLAN_FEATURES[plan];
  const items = [
    { icon: '📦', label: 'My Orders', to: '/profile/orders' },
    { icon: '🏪', label: 'My Listings', to: '/profile/listings' },
    { icon: '❤️', label: 'Wishlist', to: '/profile/wishlist' },
    { icon: '💳', label: 'Membership', to: '/profile/membership' },
    { icon: '🔔', label: 'Notifications', to: '/profile/notifications', badge: unreadCount || null },
    { icon: '🔒', label: 'Change Password', to: '/profile/change-password' },
    ...(user?.role === 'admin' ? [{ icon: '⚙️', label: 'Admin Panel', to: '/admin' }] : []),
    { icon: 'ℹ️', label: 'About PaperTrail', to: '/about' },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold">Profile</h1>
      <div className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-md">
        {user?.avatar ? (
          <img src={user.avatar} alt={`${user.name}'s avatar`} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xxl font-bold text-white">{user?.name?.[0]?.toUpperCase()}</div>
        )}
        <div className="flex-1">
          <p className="text-lg font-bold">{user?.name}</p>
          <p className="text-sm text-muted">{user?.email}</p>
          <Badge label={plan.charAt(0).toUpperCase() + plan.slice(1)} preset={planPreset[plan] || 'default'} className="mt-1.5" />
        </div>
        <Link to="/profile/edit" className="rounded-full bg-secondary px-3.5 py-2 text-sm font-semibold">Edit</Link>
      </div>
      <div className={`mt-4 flex items-center justify-between rounded-xl border-2 bg-card p-4 ${plan === 'ultimate' ? 'border-accent' : plan === 'premium' ? 'border-primary' : 'border-border'}`}>
        <div>
          <p className="font-bold">📖 {planInfo?.name} Plan</p>
          <p className="text-sm text-muted">{plan === 'free' ? 'Free forever' : `$${planInfo?.price}/month`}</p>
        </div>
        {plan === 'free' && <Link to="/profile/membership" className="rounded-full bg-accent px-3.5 py-2 text-sm font-bold text-white">Upgrade →</Link>}
      </div>
      {unreadCount > 0 && (
        <Link to="/profile/notifications" className="mt-4 block rounded-md border-l-4 border-warning bg-yellow-100 p-3 text-sm font-medium text-amber-800">
          🔔 You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
        </Link>
      )}
      <div className="mt-4 overflow-hidden rounded-xl bg-card shadow-sm">
        {items.map((item) => (
          <Link key={item.label} to={item.to} className="flex items-center border-b border-border px-4 py-4 last:border-0">
            <span className="mr-3 text-xl">{item.icon}</span>
            <span className="flex-1 font-medium">{item.label}</span>
            {item.badge ? <span className="mr-2 rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">{item.badge}</span> : null}
            <span className="text-xl text-muted">›</span>
          </Link>
        ))}
      </div>
      <Button title="Logout" variant="outline" fullWidth className="mt-4" onClick={() => { logout(); showToast('Logged out successfully', 'info'); }} />
    </div>
  );
}
