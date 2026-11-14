import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { bookService } from '../services/bookService';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useToastStore } from '../store/toastStore';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import CoverImage from '../components/ui/CoverImage';
import { bareControlClass } from '../components/ui/Input';
import StarRating from '../components/ui/StarRating';
import { money } from '../utils/money';
import { useDocumentTitle } from '../utils/useDocumentTitle';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useDocumentTitle(book?.title || 'Book');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [bRes, rRes] = await Promise.all([bookService.getBook(id), bookService.getReviews(id)]);
      if (bRes.success) setBook(bRes.data);
      if (rRes.success) setReviews(rRes.data);
      if (isAuthenticated) {
        const w = await api.get(`/wishlist/check/${id}`);
        setWished(!!w.data.inWishlist);
      }
    } catch (err) {
      setError(err.message || 'Could not load this book');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, isAuthenticated]);

  const handleAddToCart = () => {
    addItem(book, qty);
    showToast(`"${book.title}" added to cart`, 'success');
  };

  const toggleWish = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { state: { from: `/books/${id}` } });
      return;
    }
    try {
      const res = await api.post('/wishlist/toggle', { bookId: id });
      setWished(!!res.data.added);
      showToast(res.data.added ? 'Added to wishlist' : 'Removed from wishlist', 'success');
    } catch (err) {
      showToast(err.message || 'Wishlist update failed', 'error');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewing(true);
    try {
      const res = await bookService.createReview(id, rating, comment);
      if (res.success) {
        setReviews((list) => [res.data, ...list]);
        setComment('');
        showToast('Review posted', 'success');
        const fresh = await bookService.getBook(id);
        if (fresh.success) setBook(fresh.data);
      }
    } catch (err) {
      showToast(err.message || 'Could not post review', 'error');
    }
    setReviewing(false);
  };

  if (loading) return <p className="py-16 text-center text-muted">Loading book…</p>;
  if (error) return <p className="py-16 text-center text-error">{error} <button type="button" className="underline" onClick={load}>Retry</button></p>;
  if (!book) return <p className="py-16 text-center">Book not found</p>;

  return (
    <div>
      <Link to="/books" className="text-sm font-semibold text-accent">← All books</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="relative rounded-xl bg-secondary p-6">
          <CoverImage src={book.coverUrl} alt={book.title} className="mx-auto h-[320px] w-[200px] rounded-md shadow-lg" />
          {book.discount > 0 && <Badge label={`-${book.discount}% OFF`} preset="accent" className="absolute right-4 top-4" />}
        </div>
        <div>
          <h1 className="text-xxl font-extrabold leading-tight">{book.title}</h1>
          <p className="mt-1 text-muted">by {book.author}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StarRating rating={book.rating} size={18} showCount count={book.reviewCount} />
            <Badge label={book.genre} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-xxxl font-extrabold text-accent">{money(book.price)}</span>
            {book.originalPrice > book.price && <span className="text-lg text-mutedLight line-through">{money(book.originalPrice)}</span>}
            {book.stock === 0 ? <Badge label="Out of Stock" preset="error" /> : <Badge label={`${book.stock} in stock`} preset="success" />}
          </div>
          {user?.role === 'admin' && (
            <Link to={`/admin?tab=Books&edit=${book._id}`} className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
              Edit book
            </Link>
          )}
          {book.description && (
            <div className="mt-6">
              <h2 className="text-lg font-bold">About this book</h2>
              <p className="mt-2 leading-7 text-textSecondary">{book.description}</p>
            </div>
          )}
          {book.stock > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="font-semibold">Quantity</span>
              <div className="flex items-center">
                <button type="button" className="h-10 w-10 rounded-full border border-border bg-secondary" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span className="w-12 text-center text-lg font-bold">{qty}</span>
                <button type="button" className="h-10 w-10 rounded-full border border-border bg-secondary" onClick={() => setQty((q) => Math.min(book.stock, q + 1))} aria-label="Increase quantity">+</button>
              </div>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button title="Add to Cart" variant="outline" disabled={book.stock === 0} onClick={handleAddToCart} className="flex-1" />
            <Button title="Buy Now" disabled={book.stock === 0} onClick={() => { handleAddToCart(); navigate('/cart'); }} className="flex-1" />
            <button type="button" onClick={toggleWish} aria-pressed={wished} className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-3 font-semibold ${wished ? 'border-accent bg-accent text-white' : 'border-border bg-card'}`}>
              <Heart size={16} fill={wished ? 'currentColor' : 'none'} /> {wished ? 'Wishlisted' : 'Wishlist'}
            </button>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Customer Reviews</h2>
        {reviews.length === 0 && <p className="mt-3 text-sm text-muted">No reviews yet.</p>}
        <div className="mt-4 space-y-3">
          {reviews.slice(0, 8).map((r) => (
            <article key={r._id} className="rounded-md bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-white">{r.user?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="text-sm font-semibold">{r.user?.name}</p>
                  <StarRating rating={r.rating} size={13} />
                </div>
              </div>
              {r.comment && <p className="mt-2 text-sm leading-5 text-textSecondary">{r.comment}</p>}
            </article>
          ))}
        </div>
        {isAuthenticated ? (
          <form onSubmit={submitReview} className="mt-6 max-w-xl rounded-xl bg-card p-4 shadow-sm">
            <h3 className="mb-2 font-bold">Write a review</h3>
            <StarRating rating={rating} editable onRate={setRating} size={22} />
            <label htmlFor="review" className="mt-3 block text-sm font-semibold">Comment</label>
            <textarea id="review" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className={`mt-1 ${bareControlClass}`} placeholder="Share your thoughts" />
            <Button title="Post review" type="submit" loading={reviewing} className="mt-3" />
          </form>
        ) : (
          <p className="mt-4 text-sm text-muted">
            <Link to="/auth/login" state={{ from: `/books/${id}` }} className="font-semibold text-accent">Sign in</Link> to write a review.
          </p>
        )}
      </section>
    </div>
  );
}
