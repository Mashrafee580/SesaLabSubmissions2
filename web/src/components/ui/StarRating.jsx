export default function StarRating({ rating = 0, maxStars = 5, size = 16, editable = false, onRate, showCount, count = 0 }) {
  return (
    <div className="flex items-center" aria-label={`Rating ${rating} out of ${maxStars}`}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        const mark = (
          <span style={{ fontSize: size, color: filled || half ? '#f59e0b' : '#d1ccc5' }}>
            {filled ? '★' : half ? '½' : '☆'}
          </span>
        );
        if (!editable) return <span key={i} className="leading-none">{mark}</span>;
        return (
          <button key={i} type="button" onClick={() => onRate?.(i + 1)} className="leading-none" aria-label={`Rate ${i + 1} stars`}>
            {mark}
          </button>
        );
      })}
      {showCount && <span className="ml-1 text-muted" style={{ fontSize: size * 0.75 }}>({count})</span>}
    </div>
  );
}
