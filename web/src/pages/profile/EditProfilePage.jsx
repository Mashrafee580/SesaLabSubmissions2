import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
});

export default function EditProfilePage() {
  useDocumentTitle('Edit profile');
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const showToast = useToastStore((s) => s.show);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      zip: user?.address?.zip || '',
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await updateUser({
        name: values.name,
        phone: values.phone,
        address: { street: values.street, city: values.city, zip: values.zip },
      });
      if (res.success) { showToast('Profile updated!', 'success'); navigate('/profile'); }
      else showToast(res.message || 'Update failed', 'error');
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-bold">Edit Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full Name *" {...register('name')} error={errors.name?.message} />
        <Input label="Phone Number" {...register('phone')} />
        <Input label="Street Address" {...register('street')} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="City" {...register('city')} />
          <Input label="ZIP" {...register('zip')} />
        </div>
        <Button title="Save Changes" type="submit" loading={loading} fullWidth size="lg" />
      </form>
    </div>
  );
}
