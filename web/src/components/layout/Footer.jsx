import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-10 bg-primary px-6 py-10 text-center text-white">
      <p className="text-xl font-extrabold">PaperTrail</p>
      <p className="mt-1 text-sm text-white/60">Your friendly online bookstore</p>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm">
        <Link to="/books" className="text-accentLight">Books</Link>
        <Link to="/marketplace" className="text-accentLight">Marketplace</Link>
        <Link to="/about" className="text-accentLight">About Us</Link>
      </div>
      <p className="mt-4 text-xs text-white/40">© 2025 PaperTrail. All rights reserved.</p>
    </footer>
  );
}
