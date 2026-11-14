import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { useAuthStore } from '../store/authStore';
import BookCard from '../components/books/BookCard';
import { BookCardSkeleton } from '../components/ui/SkeletonLoader';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const BANNERS = [
  { id: 1, title: 'Discover New Worlds', subtitle: 'Explore thousands of books', cta: 'Browse Now', className: 'from-primary to-primaryLight' },
  { id: 2, title: 'Weekend Sale', subtitle: 'Up to 50% off bestsellers', cta: 'Shop Sale', className: 'from-accent to-accentLight' },
  { id: 3, title: 'Join Our Club', subtitle: 'Unlock exclusive member benefits', cta: 'View Plans', className: 'from-success to-emerald-400' },
];

const CATEGORIES = [
  { label: 'Fiction', icon: '📖' }, { label: 'Science', icon: '🔬' },
  { label: 'Technology', icon: '💻' }, { label: 'Business', icon: '💼' },
  { label: 'History', icon: '🏛️' }, { label: 'Mystery', icon: '🔍' },
  { label: 'Romance', icon: '💕' }, { label: 'Self Development', icon: '🌱' },
];

const WHY = [
  { icon: '📦', t: 'Fast Delivery', s: 'Get books at your doorstep' },
  { icon: '💎', t: 'Premium Quality', s: 'Curated book selection' },
  { icon: '🏪', t: 'Marketplace', s: 'Buy & sell used books' },
  { icon: '🎁', t: 'Member Deals', s: 'Exclusive member discounts' },
];

function Section({ title, data, loading }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <Link to="/books" className="text-sm font-semibold text-accent">See All →</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {loading
          ? [1, 2, 3, 4].map((n) => <BookCardSkeleton key={n} />)
          : data.map((book) => <BookCard key={book._id} book={book} />)}
      </div>
    </section>
  );
}

export default function HomePage() {
  useDocumentTitle('Home');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bannerIdx, setBannerIdx] = useState(0);

  const load = async () => {
    setError('');
    try {
      const [f, n, b] = await Promise.all([
        bookService.getFeatured(),
        bookService.getNewArrivals(),
        bookService.getBestSellers(),
      ]);
      setFeatured(f.data || []);
      setNewArrivals(n.data || []);
      setBestSellers(b.data || []);
    } catch (err) {
      setError(err.message || 'Could not load books');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const timer = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[bannerIdx];

  return (
    <div>
      <p className="mb-4 text-sm text-muted">{user ? `Hello, ${user.name.split(' ')[0]} 👋` : 'Welcome back 👋'}</p>
      <section className={`rounded-xl bg-gradient-to-br ${banner.className} p-8 text-white sm:p-10`} aria-roledescription="carousel">
        <h1 className="text-xxl font-extrabold sm:text-xxxl">{banner.title}</h1>
        <p className="mt-2 text-white/85">{banner.subtitle}</p>
        <button type="button" className="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-primary" onClick={() => navigate('/books')}>{banner.cta}</button>
        <div className="mt-6 flex gap-1.5">
          {BANNERS.map((b, i) => (
            <button key={b.id} type="button" aria-label={`Banner ${i + 1}`} className={`h-1.5 rounded-full ${i === bannerIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} onClick={() => setBannerIdx(i)} />
          ))}
        </div>
      </section>

      {error && (
        <div className="mt-4 rounded-md border border-error bg-red-50 p-4 text-sm text-error">
          {error} <button type="button" className="ml-2 font-semibold underline" onClick={load}>Retry</button>
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Browse Categories</h2>
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button key={c.label} type="button" className="min-w-20 rounded-lg bg-card px-4 py-3 text-center shadow-sm" onClick={() => navigate(`/books?genre=${encodeURIComponent(c.label)}`)}>
              <span className="block text-2xl">{c.icon}</span>
              <span className="text-xs font-semibold">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      <Section title="Featured Books" data={featured} loading={loading} />
      <Section title="Best Sellers" data={bestSellers} loading={loading} />
      <Section title="New Arrivals" data={newArrivals} loading={loading} />

      <Link to="/profile/membership" className="mt-8 block rounded-xl bg-gradient-to-r from-primary to-primaryLight p-8 text-white">
        <h2 className="text-xl font-bold">📖 Become a Member</h2>
        <p className="mt-1 text-sm text-white/80">Unlock exclusive discounts, free shipping & more</p>
        <span className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-sm font-bold">View Plans →</span>
      </Link>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Why PaperTrail?</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.t} className="rounded-lg bg-card p-4 shadow-sm">
              <div className="text-2xl">{w.icon}</div>
              <h3 className="mt-2 text-md font-bold">{w.t}</h3>
              <p className="text-xs text-muted">{w.s}</p>
            </div>
          ))}
        </div>
      </section>

      <Link to="/marketplace" className="mt-6 flex items-center gap-4 rounded-lg bg-card p-4 shadow-sm">
        <span className="text-4xl">🏪</span>
        <span className="flex-1">
          <span className="block font-bold">PaperTrail Marketplace</span>
          <span className="text-xs text-muted">Buy & sell books with fellow readers</span>
        </span>
        <span className="text-accent">→</span>
      </Link>
    </div>
  );
}
