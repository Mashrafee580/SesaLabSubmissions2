import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { useAuthStore } from '../store/authStore';
import { GENRES } from '../constants/api';
import BookGridCard from '../components/books/BookGridCard';
import { BookCardSkeleton } from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import { controlClass, shellClass } from '../components/ui/Input';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
];
const LIMIT = 20;

export default function BooksPage() {
  useDocumentTitle('Books');
  const [params] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState(params.get('genre') || '');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setGenre(params.get('genre') || '');
  }, [params]);

  const fetchBooks = useCallback(async (pg = 1) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    setError('');
    try {
      const res = await bookService.getBooks({ search, genre, sort, page: pg, limit: LIMIT });
      if (res.success) {
        setBooks((prev) => (pg === 1 ? res.data : [...prev, ...res.data]));
        setHasMore(pg < res.pagination.totalPages);
        setPage(pg);
      }
    } catch (err) {
      setError(err.message || 'Could not load books');
    }
    setLoading(false);
    setLoadingMore(false);
  }, [search, genre, sort]);

  useEffect(() => {
    const t = setTimeout(() => { fetchBooks(1); }, 250);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">All Books</h1>
        {user?.role === 'admin' && (
          <Link to="/admin?tab=Books&new=1" className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white">
            Add book
          </Link>
        )}
      </div>
      <div className={shellClass({ pill: true, className: 'my-3' })}>
        <span aria-hidden="true" className="shrink-0">🔍</span>
        <input
          className={`${controlClass} px-2`}
          placeholder="Search books, authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search books"
        />
        {search && (
          <button type="button" aria-label="Clear search" className="shrink-0 px-1" onClick={() => setSearch('')}>
            ✕
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto py-1">
        {['All', ...GENRES].map((g) => {
          const active = g === 'All' ? !genre : genre === g;
          return (
            <button key={g} type="button" onClick={() => setGenre(g === 'All' ? '' : g)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${active ? 'border-primary bg-primary text-white' : 'border-border bg-card'}`}>{g}</button>
          );
        })}
      </div>
      <div className="mb-4 mt-2 flex gap-2 overflow-x-auto">
        {SORT_OPTIONS.map((s) => (
          <button key={s.value} type="button" onClick={() => setSort(s.value)} className={`shrink-0 rounded-sm px-3.5 py-1.5 text-xs font-medium ${sort === s.value ? 'bg-accent text-white' : 'bg-secondary text-muted'}`}>{s.label}</button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-error">{error} <button type="button" className="underline" onClick={() => fetchBooks(1)}>Retry</button></p>}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <BookCardSkeleton key={i} />)}
        </div>
      ) : books.length === 0 ? (
        <EmptyState icon="📚" title="No Books Found" subtitle="Try adjusting your search or filters." actionLabel="Clear Filters" onAction={() => { setSearch(''); setGenre(''); }} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => <BookGridCard key={book._id} book={book} />)}
          </div>
          {hasMore && (
            <div className="mt-6 text-center">
              <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white disabled:opacity-50" disabled={loadingMore} onClick={() => fetchBooks(page + 1)}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
