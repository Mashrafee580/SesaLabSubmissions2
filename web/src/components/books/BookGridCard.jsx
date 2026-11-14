import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';
import Badge from '../ui/Badge';
import CoverImage from '../ui/CoverImage';
import StarRating from '../ui/StarRating';
import { money } from '../../utils/money';

export default function BookGridCard({ book }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const out = book.stock === 0;

  return (
    <article className="overflow-hidden rounded-lg bg-card shadow-md">
      <button type="button" className="block w-full text-left" onClick={() => navigate(`/books/${book._id}`)}>
        <div className="relative">
          <CoverImage src={book.coverUrl} alt={book.title} className="h-[180px] w-full sm:h-[220px]" />
          {book.discount > 0 && <Badge label={`-${book.discount}%`} preset="accent" className="absolute left-2 top-2" />}
          {out && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-sm font-bold text-white">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="mb-0.5 line-clamp-2 text-sm font-bold leading-[18px] text-text">{book.title}</h3>
          <p className="mb-1 truncate text-xs text-muted">{book.author}</p>
          <div className="mb-2 flex items-center">
            <StarRating rating={book.rating} size={12} />
            <span className="ml-1 text-[10px] text-muted">({book.reviewCount})</span>
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between px-2 pb-2">
        <div>
          <p className="text-md font-bold text-accent">{money(book.price)}</p>
          {book.originalPrice > book.price && <p className="text-[10px] text-mutedLight line-through">{money(book.originalPrice)}</p>}
        </div>
        <button
          type="button"
          disabled={out}
          aria-label={`Add ${book.title} to cart`}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xl font-bold leading-none text-white disabled:bg-mutedLight"
          onClick={() => {
            addItem(book);
            showToast(`"${book.title}" added to cart`);
          }}
        >
          +
        </button>
      </div>
    </article>
  );
}
