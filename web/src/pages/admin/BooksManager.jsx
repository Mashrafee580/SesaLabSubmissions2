import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminService } from '../../services/adminService';
import { bookService } from '../../services/bookService';
import { useToastStore } from '../../store/toastStore';
import { GENRES } from '../../constants/api';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CoverImage from '../../components/ui/CoverImage';
import Input, { bareControlClass } from '../../components/ui/Input';
import { ConfirmModal } from '../../components/ui/Modal';
import { money } from '../../utils/money';

const EMPTY_BOOK = {
  title: '',
  author: '',
  genre: 'Fiction',
  price: '',
  originalPrice: '',
  stock: '10',
  isbn: '',
  description: '',
  coverUrl: '',
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
};

const bookSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required'),
  genre: z.string().min(1, 'Genre is required'),
  price: z.string().refine(
    (value) => value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0,
    'Price must be a number greater than or equal to 0'
  ),
  originalPrice: z.string().refine(
    (value) => value.trim() === '' || (Number.isFinite(Number(value)) && Number(value) >= 0),
    'Original price must be a number greater than or equal to 0'
  ),
  stock: z.string().refine(
    (value) => value.trim() !== '' && Number.isInteger(Number(value)) && Number(value) >= 0,
    'Stock must be a non-negative integer'
  ),
  isbn: z.string(),
  description: z.string(),
  coverUrl: z.string(),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isBestSeller: z.boolean(),
}).superRefine((values, ctx) => {
  if (values.originalPrice.trim() && Number(values.originalPrice) < Number(values.price)) {
    ctx.addIssue({
      code: 'custom',
      path: ['originalPrice'],
      message: 'Original price must be greater than or equal to price',
    });
  }
});

function getBookValues(book) {
  return {
    title: book.title || '',
    author: book.author || '',
    genre: book.genre || 'Fiction',
    price: String(book.price ?? ''),
    originalPrice: book.originalPrice > book.price ? String(book.originalPrice) : '',
    stock: String(book.stock ?? 0),
    isbn: book.isbn || '',
    description: book.description || '',
    coverUrl: book.coverUrl || '',
    isFeatured: !!book.isFeatured,
    isNewArrival: !!book.isNewArrival,
    isBestSeller: !!book.isBestSeller,
  };
}

export default function BooksManager({ initialRequest }) {
  const showToast = useToastStore((state) => state.show);
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0, limit: 20 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(!!initialRequest);
  const [editingId, setEditingId] = useState(initialRequest?.type === 'edit' ? initialRequest.id : null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const requestHandled = useRef(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: EMPTY_BOOK,
  });

  const loadBooks = useCallback(async (page = 1, searchTerm = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await bookService.getBooks({ search: searchTerm, page, limit: 20, sort: 'newest' });
      if (response.success) {
        setBooks(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Could not load books');
      }
    } catch (err) {
      setError(err.message || 'Could not load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadBooks(1, search); }, 200);
    return () => clearTimeout(timer);
  }, [loadBooks, search]);

  useEffect(() => {
    if (!initialRequest || requestHandled.current) return;
    requestHandled.current = true;
    if (initialRequest.type === 'new') return;
    if (initialRequest.type === 'edit') {
      bookService.getBook(initialRequest.id).then((response) => {
        if (response.success) {
          setEditingId(response.data._id);
          reset(getBookValues(response.data));
        } else {
          showToast(response.message || 'Could not load book', 'error');
          setFormOpen(false);
        }
      }).catch((err) => {
        showToast(err.message || 'Could not load book', 'error');
        setFormOpen(false);
      });
    }
  }, [initialRequest, reset, showToast]);

  const startNewBook = () => {
    setEditingId(null);
    reset(EMPTY_BOOK);
    setFormOpen(true);
  };

  const startEditBook = (book) => {
    setEditingId(book._id);
    reset(getBookValues(book));
    setFormOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      title: values.title.trim(),
      author: values.author.trim(),
      price: Number(values.price),
      originalPrice: values.originalPrice.trim() ? Number(values.originalPrice) : 0,
      stock: Number(values.stock),
    };
    try {
      const response = editingId
        ? await adminService.updateBook(editingId, payload)
        : await adminService.createBook(payload);
      if (!response.success) {
        showToast(response.message || 'Save failed', 'error');
        return;
      }
      showToast(editingId ? 'Book updated' : 'Book created', 'success');
      setFormOpen(false);
      setEditingId(null);
      reset(EMPTY_BOOK);
      await loadBooks(pagination.currentPage, search);
    } catch (err) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const uploadCover = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const response = await adminService.uploadCover(file, (progressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        }
      });
      if (!response.success) {
        showToast(response.message || 'Cover upload failed', 'error');
        return;
      }
      setValue('coverUrl', response.data.url, { shouldDirty: true, shouldValidate: true });
      setUploadProgress(100);
      showToast('Cover uploaded', 'success');
    } catch (err) {
      showToast(err.message || 'Cover upload failed', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeBook = async (book) => {
    try {
      const response = await adminService.deleteBook(book._id);
      if (!response.success) {
        showToast(response.message || 'Delete failed', 'error');
        return;
      }
      showToast('Book deleted', 'info');
      setConfirm(null);
      await loadBooks(pagination.currentPage, search);
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const submitForm = handleSubmit(onSubmit);
  // oxlint-disable-next-line react/incompatible-library
  const price = watch('price');
  // oxlint-disable-next-line react/incompatible-library
  const originalPrice = watch('originalPrice');
  const priceNumber = Number(price);
  const originalPriceNumber = Number(originalPrice);
  const discount = originalPrice && Number.isFinite(priceNumber) && originalPriceNumber > priceNumber
    ? Math.round((1 - priceNumber / originalPriceNumber) * 100)
    : 0;
  const pageCount = Math.max(1, pagination.totalPages || 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Input
          placeholder="Search books or authors..."
          aria-label="Search books"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-0 min-w-[220px] flex-1"
        />
        <Button title="Add book" onClick={startNewBook} />
      </div>

      {formOpen && (
        <form onSubmit={submitForm} className="mb-4 rounded-xl bg-card p-4 shadow-sm">
          <h2 className="mb-3 font-bold">{editingId ? 'Edit book' : 'New book'}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Title" {...register('title')} error={errors.title?.message} />
            <Input label="Author" {...register('author')} error={errors.author?.message} />
            <label className="mb-4 block text-sm font-semibold">Genre
              <select className={`mt-1.5 ${bareControlClass}`} {...register('genre')}>
                {GENRES.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
              </select>
              {errors.genre?.message && <span className="mt-1 block text-xs text-error">{errors.genre.message}</span>}
            </label>
            <Input label="Price" type="number" min="0" step="0.01" {...register('price')} error={errors.price?.message} />
            <div>
              <Input
                label="Original price (optional)"
                type="number"
                min="0"
                step="0.01"
                {...register('originalPrice')}
                error={errors.originalPrice?.message}
              />
              <p className="-mt-3 mb-4 text-xs text-muted">Set higher than price to show a discount</p>
            </div>
            <Input label="Live discount preview" value={`${discount}%`} readOnly />
            <Input label="Stock" type="number" min="0" step="1" {...register('stock')} error={errors.stock?.message} />
            <Input label="ISBN" {...register('isbn')} />
          </div>
          <Input label="Description" multiline {...register('description')} />
          <Input label="Cover URL" {...register('coverUrl')} error={errors.coverUrl?.message} />
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="book-cover-upload" className="mb-1.5 block text-sm font-semibold">Upload cover</label>
              <input
                id="book-cover-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading || isSubmitting}
                onChange={uploadCover}
                className="max-w-full rounded-md border border-border bg-card p-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
              />
              {uploading && <p className="mt-1 text-xs text-muted">Uploading cover{uploadProgress ? ` — ${uploadProgress}%` : '…'}</p>}
            </div>
            <CoverImage key={watch('coverUrl')} src={watch('coverUrl')} alt="Cover preview" className="h-28 w-20 rounded-md border border-border" />
          </div>
          <div className="mb-3 flex flex-wrap gap-4 text-sm">
            {[
              ['isFeatured', 'Featured'],
              ['isNewArrival', 'New arrival'],
              ['isBestSeller', 'Best seller'],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2">
                <input type="checkbox" {...register(field)} />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button title="Save" type="submit" loading={isSubmitting || uploading} />
            <Button title="Cancel" type="button" variant="secondary" disabled={isSubmitting || uploading} onClick={() => setFormOpen(false)} />
          </div>
        </form>
      )}

      {error && <p className="my-3 text-sm text-error">{error} <button type="button" className="underline" onClick={() => loadBooks(pagination.currentPage, search)}>Retry</button></p>}
      {loading ? (
        <p className="py-8 text-center text-muted">Loading books…</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg bg-card shadow-sm">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted">
                <tr>
                  <th className="p-3">Cover</th>
                  <th className="p-3">Title / Author</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Flags</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id} className="border-b border-border last:border-0">
                    <td className="p-3"><CoverImage src={book.coverUrl} alt={book.title} className="h-14 w-10 rounded-sm" /></td>
                    <td className="p-3">
                      <p className="font-bold">{book.title}</p>
                      <p className="text-xs text-muted">{book.author}</p>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold">{money(book.price)}</span>
                      {book.originalPrice > book.price && <span className="ml-2 text-xs text-muted line-through">{money(book.originalPrice)}</span>}
                    </td>
                    <td className={`p-3 font-semibold ${book.stock === 0 ? 'text-error' : ''}`}>
                      {book.stock === 0 ? 'Out of stock' : book.stock}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {book.isFeatured && <Badge label="Featured" preset="primary" size="xs" />}
                        {book.isNewArrival && <Badge label="New" preset="accent" size="xs" />}
                        {book.isBestSeller && <Badge label="Best seller" preset="success" size="xs" />}
                        {!book.isFeatured && !book.isNewArrival && !book.isBestSeller && <span className="text-muted">—</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button type="button" className="rounded-sm bg-secondary px-3 py-1.5 text-xs font-semibold" onClick={() => startEditBook(book)}>Edit</button>
                        <button
                          type="button"
                          className="rounded-sm border border-error px-3 py-1.5 text-xs font-semibold text-error"
                          onClick={() => setConfirm({
                            title: 'Delete book',
                            message: `Delete "${book.title}"?`,
                            danger: true,
                            run: () => removeBook(book),
                          })}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-muted">No books found.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <p className="text-muted">{pagination.total || 0} books</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-sm bg-secondary px-3 py-1.5 font-semibold disabled:opacity-50"
                disabled={pagination.currentPage <= 1 || loading}
                onClick={() => loadBooks(pagination.currentPage - 1, search)}
              >
                Previous
              </button>
              <span>Page {pagination.currentPage || 1} of {pageCount}</span>
              <button
                type="button"
                className="rounded-sm bg-secondary px-3 py-1.5 font-semibold disabled:opacity-50"
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                onClick={() => loadBooks(pagination.currentPage + 1, search)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
      <ConfirmModal
        visible={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel="Delete"
        danger={confirm?.danger}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.run}
      />
    </div>
  );
}
