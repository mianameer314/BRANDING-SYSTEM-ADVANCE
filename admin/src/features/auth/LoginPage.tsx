import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useLogin } from './hooks';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/assets/logo.svg';

export function LoginPage() {
 const navigate = useNavigate();
 const { login: authLogin } = useAuth();
 const { mutate, isPending } = useLogin();

 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [error, setError] = useState('');

 const handleSubmit = (e: FormEvent) => {
 e.preventDefault();
 setError('');
 mutate(
 { email, password },
 {
 onSuccess: async (tokens) => {
 await authLogin(tokens);
 navigate('/dashboard', { replace: true });
 },
 onError: (err) => {
 if (axios.isAxiosError(err)) {
 const detail = err.response?.data?.detail;
 setError(
 typeof detail === 'string'
 ? detail
 : 'Invalid email or password.'
 );
 } else {
 setError('Something went wrong. Please try again.');
 }
 },
 }
 );
 };

 return (
 <div className="flex min-h-screen items-center justify-center bg-background px-4">
 {/* Background glow */}
 <div className="pointer-events-none absolute inset-0 overflow-hidden">
 <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
 </div>

 <div className="relative w-full max-w-sm">
 {/* Logo */}
 <div className="mb-8 text-center">
 <div className="mx-auto mb-6 flex justify-center">
 <img src={Logo} alt="O2Geeks Logo" className="h-10 w-auto" />
 </div>
 <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Sign in to the O2Geeks CMS
 </p>
 </div>

 {/* Card */}
 <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
 <form onSubmit={handleSubmit} className="space-y-5" noValidate>
 {/* Email */}
 <div className="space-y-1.5">
 <label
 htmlFor="email"
 className="block text-sm font-medium text-foreground"
 >
 Email
 </label>
 <input
 id="email"
 type="email"
 autoComplete="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="you@o2geeks.com"
 className="w-full rounded-lg border border-border bg-accent px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
 />
 </div>

 {/* Password */}
 <div className="space-y-1.5">
 <label
 htmlFor="password"
 className="block text-sm font-medium text-foreground"
 >
 Password
 </label>
 <div className="relative">
 <input
 id="password"
 type={showPassword ? 'text' : 'password'}
 autoComplete="current-password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 className="w-full rounded-lg border border-border bg-accent py-2.5 pl-3.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
 aria-label={showPassword ? 'Hide password' : 'Show password'}
 >
 {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
 </button>
 </div>
 </div>

 {/* Error */}
 {error && (
 <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 {error}
 </div>
 )}

 {/* Submit */}
 <button
 type="submit"
 disabled={isPending}
 className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-secondary shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.02] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
 >
 {isPending ? (
 <>
 <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
 Signing in…
 </>
 ) : (
 'Sign in'
 )}
 </button>
 </form>
 </div>

 <p className="mt-6 text-center text-sm text-muted-foreground">
 Don't have an account?{' '}
 <a href="/register" className="text-primary hover:opacity-80 hover:underline transition-opacity">
 Sign up
 </a>
 </p>

 <p className="mt-6 text-center text-xs text-muted-foreground">
 @O2Geeks &middot; Admin Dashboard &middot; Designed by Mian Ameer
 </p>
 </div>
 </div>
 );
}
