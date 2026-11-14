import { useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function CoverImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(!src);
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-secondary text-muted ${className}`} role="img" aria-label={alt || 'Book cover unavailable'}>
        <BookOpen size={28} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || 'Book cover'}
      className={`bg-secondary object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
