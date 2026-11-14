import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';
import CoverImage from '../ui/CoverImage';
import StarRating from '../ui/StarRating';
import { money } from '../../utils/money';

export default function BookCard({ book }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);

  return (
    <article className="mr-3 w-40 shrink-0 overflow-hidden rounded-lg bg-card shadow-md">
      <button type="button" className="block w-full text-left" onClick={() => navigate(`/books/${book._id}`)}>
        <div className="relative">
          <CoverImage src={book.coverUrl} alt={book.title} className="h-[180px] w-full" />
          {book.discount > 0 && (
            <span className="absolute right-2 top-2 rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">-{book.discount}%</span>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="mb-0.5 line-clamp-2 text-sm font-bold leading-[18px] text-text">{book.title}</h3>
          <p className="mb-1 truncate text-xs text-muted">{book.author}</p>
          <StarRating rating={book.rating} size={12} />
          <div className="mb-2 mt-1 flex items-center gap-1.5">
            <span className="text-md font-bold text-accent">{money(book.price)}</span>
            {book.originalPrice > book.price && <span className="text-xs text-mutedLight line-through">{money(book.originalPrice)}</span>}
          </div>
        </div>
      </button>
      <div className="px-2.5 pb-2.5">
        <button
          type="button"
          className="w-full rounded-sm bg-primary py-1.5 text-xs font-semibold text-white"
          onClick={() => {
            addItem(book);
            showToast(`"${book.title}" added to cart`, 'success');
          }}
        >
          + Cart
        </button>
      </div>
    </article>
  );
}
