import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { money } from '../../utils/money';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

export default function ListingsPage() {
  useDocumentTitle('My Listings');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketplaceService.getMyListings()
      .then((r) => { if (r.success) setListings(r.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">My Listings</h1>
        <Link to="/marketplace/create" className="rounded-full bg-accent px-3.5 py-2 text-sm font-bold text-white">+ New</Link>
      </div>
      {loading && <p className="text-muted">Loading…</p>}
      {!loading && listings.length === 0 && <EmptyState icon="🏪" title="No Listings Yet" subtitle="List a book to start selling!" actionLabel="List a Book" onAction={() => { window.location.href = '/marketplace/create'; }} />}
      <div className="space-y-3">
        {listings.map((l) => (
          <article key={l._id} className="rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="truncate font-bold">{l.title}</h2>
              <Badge label={l.status} preset={l.status === 'approved' ? 'approved' : l.status === 'rejected' ? 'rejected' : 'pending'} />
            </div>
            <p className="mb-2 text-sm text-muted">by {l.author} · {money(l.price)}</p>
            <div className="flex gap-1.5">
              <Badge label={l.listingType} preset={l.listingType === 'sell' ? 'sell' : 'buy'} size="xs" />
              <Badge label={l.condition} size="xs" />
            </div>
            {l.status === 'rejected' && l.rejectionReason && <p className="mt-2 rounded-sm bg-red-100 p-2 text-xs text-error">Rejected: {l.rejectionReason}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
