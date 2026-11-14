import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../utils/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="py-20 text-center">
      <p className="text-6xl">📄</p>
      <h1 className="mt-4 text-xxxl font-extrabold">Page not found</h1>
      <p className="mt-2 text-muted">That link does not match a PaperTrail page.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-white">Back home</Link>
    </div>
  );
}
