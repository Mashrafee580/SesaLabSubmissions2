import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const showToast = useToastStore((s) => s.show);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await registerUser(values.name.trim(), values.email.trim().toLowerCase(), values.password);
      if (res.success) {
        showToast(`Welcome, ${res.data.user.name.split(' ')[0]}!`, 'success');
        navigate('/', { replace: true });
      } else showToast(res.message || 'Registration failed', 'error');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md py-6">
      <h1 className="text-xxxl font-extrabold">Create Account</h1>
      <p className="mb-6 text-muted">Join thousands of book lovers</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full Name" {...register('name')} error={errors.name?.message} />
        <Input label="Email Address" type="email" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" placeholder="Min 6 characters" {...register('password')} error={errors.password?.message} />
        <Input label="Confirm Password" type="password" {...register('confirm')} error={errors.confirm?.message} />
        <Button title="Create Account" type="submit" loading={loading} fullWidth size="lg" />
      </form>
      <p className="mt-6 text-center text-muted">Already have an account? <Link to="/auth/login" className="font-bold text-accent">Sign in</Link></p>
    </div>
  );
}
