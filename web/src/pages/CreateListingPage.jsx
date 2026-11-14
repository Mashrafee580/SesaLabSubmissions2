import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { marketplaceService } from '../services/marketplaceService';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { CONDITIONS, GENRES } from '../constants/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  author: z.string().trim().min(1, 'Author is required'),
  description: z.string().optional(),
  price: z.string().refine((v) => v !== '' && !Number.isNaN(parseFloat(v)) && parseFloat(v) >= 0, 'Enter a valid price'),
  coverUrl: z.string().optional(),
  location: z.string().optional(),
  listingType: z.enum(['sell', 'buy']),
  condition: z.string(),
  category: z.string(),
});

function Chips({ label, options, value, onChange }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="flex gap-2 overflow-x-auto">
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => onChange(opt)} className={`shrink-0 rounded-full border-[1.5px] px-4 py-2 text-sm font-medium capitalize ${value === opt ? 'border-primary bg-primary text-white' : 'border-border bg-secondary'}`}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

export default function CreateListingPage() {
  useDocumentTitle('List a Book');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.show);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', author: '', description: '', price: '', coverUrl: '', location: '', listingType: 'sell', condition: 'Good', category: 'General' },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await marketplaceService.createListing({
        ...values,
        price: parseFloat(values.price),
        sellerName: user.name,
      });
      if (res.success) {
        showToast('Listing submitted for review! 🎉', 'success');
        navigate('/profile/listings');
      } else showToast(res.message || 'Submission failed', 'error');
    } catch (err) {
      showToast(err.message || 'Submission failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-bold">List a Book</h1>
      <div className="my-4 rounded-lg border-l-4 border-warning bg-yellow-100 p-4">
        <p className="text-sm font-bold text-amber-800">📋 Review Required</p>
        <p className="text-xs leading-5 text-amber-900">Your listing will be reviewed by our team before going live. This usually takes less than 24 hours.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Book Title *" {...register('title')} error={errors.title?.message} />
        <Input label="Author *" {...register('author')} error={errors.author?.message} />
        <Input label="Description" multiline {...register('description')} placeholder="Describe the book's condition, edition, etc." />
        <Input label="Price ($) *" {...register('price')} error={errors.price?.message} inputMode="decimal" />
        <Input label="Cover Image URL" {...register('coverUrl')} placeholder="https://..." />
        <Input label="Your Location" {...register('location')} placeholder="City, Country" />
        <Chips label="Listing Type" options={['sell', 'buy']} value={watch('listingType')} onChange={(v) => setValue('listingType', v)} />
        <Chips label="Condition" options={CONDITIONS} value={watch('condition')} onChange={(v) => setValue('condition', v)} />
        <Chips label="Category" options={GENRES} value={watch('category')} onChange={(v) => setValue('category', v)} />
        <Button title="Submit for Review" type="submit" loading={loading} fullWidth size="lg" />
      </form>
    </div>
  );
}
