import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const showToast = useToastStore((s) => s.show);
  const [loading, setLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res.success) {
        showToast(`Welcome back, ${res.data.user.name.split(' ')[0]}!`, 'success');
        const from = location.state?.from;
        if (from) navigate(from, { replace: true });
        else if (res.data.user.role === 'admin') navigate('/admin', { replace: true });
        else navigate('/', { replace: true });
      } else showToast(res.message || 'Login failed', 'error');
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    }
    setLoading(false);
  };

  const forgot = async () => {
    const email = getValues('email');
    if (!email) { showToast('Enter your email first', 'error'); return; }
    try {
      const res = await authService.forgotPassword(email);
      setForgotMsg(res.message);
    } catch (err) {
      showToast(err.message || 'Request failed', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="mb-6 text-center">
        <p className="text-5xl">📖</p>
        <p className="text-xxl font-extrabold tracking-wide text-primary">PaperTrail</p>
      </div>
      <h1 className="text-xxxl font-extrabold">Welcome Back</h1>
      <p className="mb-6 text-muted">Sign in to continue reading</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email Address" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
        <Input label="Password" type="password" placeholder="Your password" {...register('password')} error={errors.password?.message} />
        <button type="button" className="mb-3 text-sm font-semibold text-accent" onClick={forgot}>Forgot password?</button>
        {forgotMsg && <p className="mb-3 text-sm text-success">{forgotMsg}</p>}
        <Button title="Sign In" type="submit" loading={loading} fullWidth size="lg" />
      </form>
      <p className="mt-6 text-center text-muted">Don't have an account? <Link to="/auth/register" className="font-bold text-accent">Create one</Link></p>
      <div className="mt-8 rounded-lg bg-secondary p-4">
        <p className="mb-1 text-sm font-bold">Demo Accounts</p>
        <p className="text-xs text-muted">Admin: admin@papertrail.com / admin123</p>
        <p className="text-xs text-muted">User: user@papertrail.com / user123</p>
      </div>
    </div>
  );
}
