import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../services/marketplaceService';
import { useAuthStore } from '../store/authStore';
import { CONDITIONS, GENRES } from '../constants/api';
import ListingCard from '../components/marketplace/ListingCard';
import EmptyState from '../components/ui/EmptyState';
import { ListItemSkeleton } from '../components/ui/SkeletonLoader';
import { controlClass, shellClass } from '../components/ui/Input';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const TABS = [{ id: 'all', label: 'All' }, { id: 'sell', label: 'Selling' }, { id: 'buy', label: 'Buying' }];

export default function MarketplacePage() {
  useDocumentTitle('Marketplace');
  const navigate = useNavigate();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const goCreate = () => navigate(isAuth ? '/marketplace/create' : '/auth/login', isAuth ? undefined : { state: { from: '/marketplace/create' } });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { search };
      if (tab !== 'all') params.type = tab;
      if (category) params.category = category;
      if (condition) params.condition = condition;
      const res = await marketplaceService.getListings(params);
      if (res.success) setListings(res.data);
    } catch (err) {
      setError(err.message || 'Could not load listings');
    }
    setLoading(false);
  }, [tab, search, category, condition]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Marketplace</h1>
          <p className="text-xs text-muted">Buy & sell books with fellow readers</p>
        </div>
        <button type="button" onClick={goCreate} className="rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white">+ List</button>
      </div>
      <div className={shellClass({ pill: true, className: 'my-3 gap-2' })}>
        <span className="shrink-0" aria-hidden="true">🔍</span>
        <input aria-label="Search listings" className={controlClass} placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="button" onClick={() => setShowFilters((v) => !v)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${showFilters ? 'bg-primary text-white' : 'bg-secondary'}`}>Filter</button>
      </div>
      <div className="mb-3 flex rounded-full bg-secondary p-1">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`flex-1 rounded-full py-2 text-sm font-medium ${tab === t.id ? 'bg-primary font-bold text-white' : 'text-muted'}`}>{t.label}</button>
        ))}
      </div>
      {showFilters && (
        <div className="mb-3 rounded-lg bg-card p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold">Category</p>
          <div className="mb-3 flex gap-1.5 overflow-x-auto">
            {['', ...GENRES].map((g) => (
              <button key={g || 'all'} type="button" onClick={() => setCategory(g)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${category === g ? 'border-primary bg-primary text-white' : 'border-border bg-secondary'}`}>{g || 'All'}</button>
            ))}
          </div>
          <p className="mb-2 text-sm font-semibold">Condition</p>
          <div className="flex gap-1.5 overflow-x-auto">
            {['', ...CONDITIONS].map((c) => (
              <button key={c || 'any'} type="button" onClick={() => setCondition(c)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${condition === c ? 'border-primary bg-primary text-white' : 'border-border bg-secondary'}`}>{c || 'Any'}</button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
      {loading ? (
        <div>{[1, 2, 3].map((n) => <ListItemSkeleton key={n} />)}</div>
      ) : listings.length === 0 ? (
        <EmptyState icon="🏪" title="No Listings Found" subtitle="Be the first to list a book!" actionLabel="List a Book" onAction={goCreate} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {listings.map((item) => <ListingCard key={item._id} listing={item} />)}
        </div>
      )}
    </div>
  );
}
