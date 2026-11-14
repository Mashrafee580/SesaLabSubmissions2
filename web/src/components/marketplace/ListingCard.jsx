import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import CoverImage from '../ui/CoverImage';
import { money } from '../../utils/money';

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/marketplace/${listing._id}`)}
      className="mb-3 flex w-full rounded-lg bg-card p-3 text-left shadow-sm"
    >
      <CoverImage src={listing.coverUrl} alt={listing.title} className="h-[110px] w-20 shrink-0 rounded-md" />
      <div className="ml-3 min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          <Badge label={listing.listingType === 'sell' ? 'Want to Sell' : 'Want to Buy'} preset={listing.listingType} size="xs" />
          <Badge label={listing.condition} size="xs" />
        </div>
        <h3 className="line-clamp-2 text-md font-bold text-text">{listing.title}</h3>
        <p className="mb-1 text-xs text-muted">by {listing.author}</p>
        {listing.description && <p className="mb-1.5 line-clamp-2 text-xs leading-[17px] text-textSecondary">{listing.description}</p>}
        <div className="flex items-end justify-between gap-2">
          <span className="text-lg font-bold text-accent">{money(listing.price)}</span>
          <span className="text-right text-xs text-muted">
            <span className="block font-medium">{listing.sellerName}</span>
            {listing.location && <span className="text-[10px]">📍 {listing.location}</span>}
          </span>
        </div>
      </div>
    </button>
  );
}
