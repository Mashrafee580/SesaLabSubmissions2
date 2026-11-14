import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/authService';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

const schema = z.object({
  current: z.string().min(1, 'All fields required'),
  newPw: z.string().min(6, 'New password must be at least 6 characters'),
  confirm: z.string().min(1, 'All fields required'),
}).refine((d) => d.newPw === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export default function ChangePasswordPage() {
  useDocumentTitle('Change password');
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.show);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { current: '', newPw: '', confirm: '' },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await authService.changePassword(values.current, values.newPw);
      if (res.success) { showToast('Password changed!', 'success'); navigate('/profile'); }
      else showToast(res.message || 'Change failed', 'error');
    } catch (err) {
      showToast(err.message || 'Change failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-bold">Change Password</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Current Password" type="password" {...register('current')} error={errors.current?.message} />
        <Input label="New Password" type="password" {...register('newPw')} error={errors.newPw?.message} />
        <Input label="Confirm New Password" type="password" {...register('confirm')} error={errors.confirm?.message} />
        <Button title="Update Password" type="submit" loading={loading} fullWidth size="lg" />
      </form>
    </div>
  );
}
