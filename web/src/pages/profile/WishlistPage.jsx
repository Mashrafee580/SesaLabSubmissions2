import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import BookGridCard from '../../components/books/BookGridCard';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useToastStore } from '../../store/toastStore';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

export default function WishlistPage() {
  useDocumentTitle('Wishlist');
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.show);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get('/wishlist/my')
      .then((r) => { if (r.data.success) setBooks(r.data.data.books || []); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const remove = async (bookId) => {
    try {
      await api.post('/wishlist/toggle', { bookId });
      setBooks((list) => list.filter((b) => b._id !== bookId));
      showToast('Removed from wishlist', 'info');
    } catch (err) {
      showToast(err.message || 'Could not update wishlist', 'error');
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">My Wishlist</h1>
      {loading && <p className="text-muted">Loading…</p>}
      {!loading && books.length === 0 && <EmptyState icon="❤️" title="Wishlist is Empty" subtitle="Add books you love to your wishlist." actionLabel="Browse Books" onAction={() => navigate('/books')} />}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {books.map((book) => (
          <div key={book._id}>
            <BookGridCard book={book} />
            <Button title="Remove" variant="ghost" size="sm" fullWidth className="mt-1" onClick={() => remove(book._id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
