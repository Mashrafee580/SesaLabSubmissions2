import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { marketplaceService } from '../services/marketplaceService';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import CoverImage from '../components/ui/CoverImage';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { money } from '../utils/money';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const schema = z.object({
  name: z.string().min(1, 'All fields required'),
  email: z.string().email('Enter a valid email'),
  message: z.string().min(1, 'All fields required'),
});

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', email: user?.email || '', message: '' },
  });

  useDocumentTitle(listing?.title || 'Listing');

  useEffect(() => {
    setLoading(true);
    marketplaceService.getListing(id)
      .then((r) => { if (r.success) setListing(r.data); else setError('Listing not found'); })
      .catch((err) => setError(err.message || 'Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const onContact = async (values) => {
    setSending(true);
    try {
      const res = await marketplaceService.contactSeller(id, { senderName: values.name, senderEmail: values.email, message: values.message });
      if (res.success) {
        setOpen(false);
        showToast('Message sent to seller!', 'success');
      } else showToast(res.message || 'Failed to send', 'error');
    } catch (err) {
      showToast(err.message || 'Failed to send', 'error');
    }
    setSending(false);
  };

  if (loading) return <p className="py-16 text-center text-muted">Loading listing…</p>;
  if (error || !listing) return <p className="py-16 text-center">{error || 'Listing not found'}</p>;

  return (
    <div>
      <Link to="/marketplace" className="text-sm font-semibold text-accent">← Marketplace</Link>
      <div className="mt-4 overflow-hidden rounded-xl bg-card shadow-sm">
        <CoverImage src={listing.coverUrl} alt={listing.title} className="h-60 w-full sm:h-80" />
        <div className="p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge label={listing.listingType === 'sell' ? 'Want to Sell' : 'Want to Buy'} preset={listing.listingType} />
            <Badge label={listing.condition} />
            <Badge label={listing.category} />
            {listing.status && listing.status !== 'approved' && <Badge label={listing.status} preset={listing.status} />}
          </div>
          <h1 className="text-xxl font-extrabold">{listing.title}</h1>
          <p className="text-muted">by {listing.author}</p>
          <p className="mt-3 text-xxxl font-extrabold text-accent">{money(listing.price)}</p>
          {listing.description && (
            <div className="mt-4">
              <h2 className="font-bold">Description</h2>
              <p className="mt-1 leading-7 text-textSecondary">{listing.description}</p>
            </div>
          )}
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-background p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">{listing.sellerName?.[0]?.toUpperCase()}</div>
            <div>
              <p className="font-bold">{listing.sellerName}</p>
              {listing.location && <p className="text-xs text-muted">📍 {listing.location}</p>}
            </div>
          </div>
          <Button
            title={listing.listingType === 'sell' ? 'Contact Seller' : 'Make an Offer'}
            fullWidth
            size="lg"
            className="mt-4"
            onClick={() => {
              if (!user) { navigate('/auth/login', { state: { from: `/marketplace/${id}` } }); return; }
              setOpen(true);
            }}
          />
        </div>
      </div>
      <Modal visible={open} onClose={() => setOpen(false)} title={listing.listingType === 'sell' ? 'Contact Seller' : 'Make an Offer'}>
        <p className="mb-3 text-sm text-muted">"{listing.title}" · {money(listing.price)}</p>
        <form onSubmit={handleSubmit(onContact)}>
          <Input label="Your Name" {...register('name')} error={errors.name?.message} />
          <Input label="Your Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Message" multiline {...register('message')} error={errors.message?.message} placeholder="Write your message..." />
          <Button title="Send Message" type="submit" loading={sending} fullWidth />
        </form>
      </Modal>
    </div>
  );
}
