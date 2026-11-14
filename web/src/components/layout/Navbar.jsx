import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';
import api from '../../services/api';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/books', label: 'Books' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [unread, setUnread] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const count = useCartStore((s) => s.getCount());
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return;
    }
    api.get('/notifications/my')
      .then((r) => {
        if (r.data.success) setUnread(r.data.data.filter((n) => !n.isRead).length);
      })
      .catch(() => {});
  }, [isAuthenticated, location.pathname]);

  const onLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  const itemClass = ({ isActive }) =>
    `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? 'bg-white/15 text-white' : 'text-white/80 hover:text-white'}`;

  return (
    <header className="sticky top-0 z-40 bg-primary text-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold tracking-wide">
          <BookOpen size={22} />
          <span className="text-xl">PaperTrail</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={itemClass}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link to="/books" aria-label="Search books" className="rounded-full p-2 hover:bg-white/10"><Search size={18} /></Link>
          <Link to={isAuthenticated ? '/profile/notifications' : '/auth/login'} aria-label="Notifications" className="relative rounded-full p-2 hover:bg-white/10">
            <Bell size={18} />
            {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold">{unread}</span>}
          </Link>
          <Link to="/cart" aria-label={`Cart, ${count} items`} className="relative rounded-full p-2 hover:bg-white/10">
            <ShoppingCart size={18} />
            {count > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold">{count > 99 ? '99+' : count}</span>}
          </Link>

          <div className="relative hidden md:block">
            <button type="button" className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-white/10" aria-expanded={menu} aria-haspopup="menu" onClick={() => setMenu((v) => !v)}>
              <User size={18} />
              <span className="max-w-[120px] truncate text-sm font-semibold">{isAuthenticated ? user?.name?.split(' ')[0] : 'Account'}</span>
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg bg-card py-1 text-text shadow-lg">
                {isAuthenticated ? (
                  <>
                    <Link role="menuitem" className="block px-4 py-2 text-sm hover:bg-secondary" to="/profile">Profile</Link>
                    <Link role="menuitem" className="block px-4 py-2 text-sm hover:bg-secondary" to="/profile/orders">Orders</Link>
                    {user?.role === 'admin' && <Link role="menuitem" className="block px-4 py-2 text-sm hover:bg-secondary" to="/admin">Admin</Link>}
                    <button type="button" role="menuitem" className="block w-full px-4 py-2 text-left text-sm hover:bg-secondary" onClick={onLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link role="menuitem" className="block px-4 py-2 text-sm hover:bg-secondary" to="/auth/login">Login</Link>
                    <Link role="menuitem" className="block px-4 py-2 text-sm hover:bg-secondary" to="/auth/register">Register</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button type="button" className="rounded-full p-2 md:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="block rounded-md px-3 py-2 text-sm font-semibold text-white/90">{l.label}</NavLink>
          ))}
          <Link to="/cart" className="block rounded-md px-3 py-2 text-sm font-semibold">Cart ({count})</Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="block rounded-md px-3 py-2 text-sm font-semibold">Profile</Link>
              <Link to="/profile/orders" className="block rounded-md px-3 py-2 text-sm font-semibold">Orders</Link>
              {user?.role === 'admin' && <Link to="/admin" className="block rounded-md px-3 py-2 text-sm font-semibold">Admin</Link>}
              <button type="button" className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="block rounded-md px-3 py-2 text-sm font-semibold">Login</Link>
              <Link to="/auth/register" className="block rounded-md px-3 py-2 text-sm font-semibold">Register</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
