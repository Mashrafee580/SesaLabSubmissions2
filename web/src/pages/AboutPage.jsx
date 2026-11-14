import { useDocumentTitle } from '../utils/useDocumentTitle';

const FEATURES = [
  { icon: '📚', title: 'Vast Book Collection', desc: 'Thousands of books across all genres, from classics to modern bestsellers.' },
  { icon: '🏪', title: 'P2P Marketplace', desc: 'Buy and sell used books with fellow readers at great prices.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Multiple delivery options to get books to your doorstep quickly.' },
  { icon: '💎', title: 'Membership Plans', desc: 'Unlock exclusive discounts, early access, and premium benefits.' },
  { icon: '⭐', title: 'Curated Selections', desc: 'Expert-curated book recommendations tailored to your taste.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Your transactions are always safe and protected.' },
];

export default function AboutPage() {
  useDocumentTitle('About');
  return (
    <div>
      <section className="rounded-xl bg-gradient-to-br from-primary to-primaryLight px-6 py-14 text-center text-white">
        <p className="text-6xl">📖</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-widest">PaperTrail</h1>
        <p className="mt-2 text-white/80">Where every page leads somewhere new</p>
      </section>
      <section className="py-8">
        <h2 className="mb-3 text-xl font-bold">Our Story</h2>
        <p className="leading-7 text-textSecondary">PaperTrail was born from a simple idea: books should be accessible to everyone. Founded in 2024, we set out to create a platform that connects book lovers with the stories they love — whether they're buying new, trading used, or discovering their next great read.</p>
      </section>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-primary p-6 text-white">
          <p className="text-3xl">🎯</p>
          <h2 className="mt-2 text-lg font-bold">Our Mission</h2>
          <p className="mt-1 text-sm text-white/85">To make reading more accessible, affordable, and community-driven for every book lover.</p>
        </div>
        <div className="rounded-xl bg-accent p-6 text-white">
          <p className="text-3xl">🌟</p>
          <h2 className="mt-2 text-lg font-bold">Our Vision</h2>
          <p className="mt-1 text-sm text-white/85">A world where every book finds its reader and every reader finds their book.</p>
        </div>
      </div>
      <section className="py-8">
        <h2 className="mb-3 text-xl font-bold">Why Choose PaperTrail?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-lg bg-card p-4 shadow-sm">
              <p className="text-2xl">{f.icon}</p>
              <h3 className="mt-2 text-sm font-bold">{f.title}</h3>
              <p className="text-xs leading-5 text-muted">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="rounded-xl bg-secondary p-6">
        <h2 className="mb-2 text-xl font-bold">Our Marketplace</h2>
        <p className="leading-7 text-textSecondary">The PaperTrail Marketplace is a peer-to-peer platform where readers can buy and sell their pre-loved books. Every listing is reviewed by our team to ensure quality and fair pricing. Connect with fellow book lovers in your community!</p>
      </section>
      <section className="py-8">
        <h2 className="mb-3 text-xl font-bold">Get in Touch</h2>
        <p><a className="text-md" href="mailto:support@papertrail.com">📧 support@papertrail.com</a></p>
        <p className="mt-2"><a className="text-md" href="tel:+8801404519140">📞 +880 140 451 9140</a></p>
        <p className="mt-2 text-md">📍 Dhaka, Bangladesh</p>
      </section>
    </div>
  );
}
