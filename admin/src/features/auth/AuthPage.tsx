import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useLogin, useRegister } from './hooks';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/assets/logo.svg';

export function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: authLogin } = useAuth();
    
    // Determine initial state based on URL
    const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');

    // Sync URL if state changes directly via buttons
    useEffect(() => {
        const path = isSignUp ? '/register' : '/login';
        if (location.pathname !== path) {
            navigate(path, { replace: true });
        }
    }, [isSignUp, navigate, location.pathname]);

    // Login State
    const { mutate: loginMutate, isPending: isLoginPending } = useLogin();
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Register State
    const { mutate: registerMutate, isPending: isRegisterPending } = useRegister();
    const [regFullName, setRegFullName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState('');

    const handleLoginSubmit = (e: FormEvent) => {
        e.preventDefault();
        setLoginError('');
        loginMutate(
            { email: loginEmail, password: loginPassword },
            {
                onSuccess: async (tokens) => {
                    await authLogin(tokens);
                    navigate('/dashboard', { replace: true });
                },
                onError: (err) => {
                    if (axios.isAxiosError(err)) {
                        const detail = err.response?.data?.detail;
                        setLoginError(typeof detail === 'string' ? detail : 'Invalid email or password.');
                    } else {
                        setLoginError('Something went wrong. Please try again.');
                    }
                },
            }
        );
    };

    const handleRegisterSubmit = (e: FormEvent) => {
        e.preventDefault();
        setRegError('');
        setRegSuccess('');

        if (regPassword !== regConfirmPassword) {
            setRegError('Passwords do not match.');
            return;
        }

        if (regPassword.length < 8) {
            setRegError('Password must be at least 8 characters.');
            return;
        }

        registerMutate(
            { full_name: regFullName, email: regEmail, password: regPassword },
            {
                onSuccess: () => {
                    setRegSuccess('Registration successful! Please sign in.');
                    setTimeout(() => {
                        setIsSignUp(false); // Slide back to login
                        setLoginEmail(regEmail); // Pre-fill email
                    }, 1500);
                },
                onError: (err) => {
                    if (axios.isAxiosError(err)) {
                        const detail = err.response?.data?.detail;
                        setRegError(typeof detail === 'string' ? detail : 'Registration failed.');
                    } else {
                        setRegError('Something went wrong. Please try again.');
                    }
                },
            }
        );
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 relative">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            </div>

            {/* Main Double-Slider Container */}
            <div className="relative w-full max-w-4xl min-h-[600px] bg-card rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* ----------------- SIGN IN FORM (Left side) ----------------- */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full bg-card transition-all duration-700 ease-in-out
                    ${isSignUp ? 'md:translate-x-full md:opacity-0 md:z-10 hidden md:block' : 'md:translate-x-0 md:opacity-100 z-20 block'}
                `}>
                    <div className="h-full flex flex-col items-center justify-center p-8 sm:p-12">
                        <img src={Logo} alt="O2Geeks Logo" className="h-8 w-auto mb-6 md:hidden" />
                        <h1 className="text-3xl font-bold text-foreground mb-2">Sign in</h1>
                        <p className="text-sm text-muted-foreground mb-8 text-center">Use your account to access the dashboard</p>

                        <form onSubmit={handleLoginSubmit} className="w-full max-w-sm space-y-4" noValidate>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-foreground">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                    placeholder="you@o2geeks.com"
                                    className="w-full rounded-xl border border-border bg-accent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-foreground">Password</label>
                                <div className="relative">
                                    <input
                                        type={showLoginPassword ? 'text' : 'password'}
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-border bg-accent py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                    >
                                        {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {loginError && (
                                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoginPending}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-secondary shadow-lg shadow-primary/20 transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:pointer-events-none"
                            >
                                {isLoginPending ? (
                                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" /> Signing in…</>
                                ) : 'SIGN IN'}
                            </button>
                        </form>

                        {/* Mobile only toggle */}
                        <p className="mt-8 text-sm text-muted-foreground md:hidden">
                            Don't have an account? <button onClick={() => setIsSignUp(true)} className="text-primary font-bold hover:underline">Sign up</button>
                        </p>
                    </div>
                </div>

                {/* ----------------- SIGN UP FORM (Right side physically, but starts left logically) ----------------- */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full bg-card transition-all duration-700 ease-in-out
                    ${isSignUp ? 'md:translate-x-full md:opacity-100 z-20 block' : 'md:translate-x-0 md:opacity-0 md:z-10 hidden md:block'}
                `}>
                    <div className="h-full flex flex-col items-center justify-center p-8 sm:p-12">
                        <img src={Logo} alt="O2Geeks Logo" className="h-8 w-auto mb-4 md:hidden" />
                        <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
                        <p className="text-sm text-muted-foreground mb-6 text-center">Join the O2Geeks CMS today</p>

                        <form onSubmit={handleRegisterSubmit} className="w-full max-w-sm space-y-3" noValidate>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-foreground">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={regFullName}
                                    onChange={(e) => setRegFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full rounded-xl border border-border bg-accent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-foreground">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    placeholder="you@o2geeks.com"
                                    className="w-full rounded-xl border border-border bg-accent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-foreground">Password</label>
                                <div className="relative">
                                    <input
                                        type={showRegPassword ? 'text' : 'password'}
                                        required
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-border bg-accent py-2.5 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegPassword(!showRegPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                    >
                                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-foreground">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showRegConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={regConfirmPassword}
                                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-border bg-accent py-2.5 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                    >
                                        {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {regError && (
                                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
                                    {regError}
                                </div>
                            )}

                            {regSuccess && (
                                <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-xs text-success">
                                    {regSuccess}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isRegisterPending}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-secondary shadow-lg shadow-primary/20 transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:pointer-events-none"
                            >
                                {isRegisterPending ? (
                                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" /> Creating…</>
                                ) : 'SIGN UP'}
                            </button>
                        </form>

                        {/* Mobile only toggle */}
                        <p className="mt-6 text-sm text-muted-foreground md:hidden">
                            Already have an account? <button onClick={() => setIsSignUp(false)} className="text-primary font-bold hover:underline">Sign in</button>
                        </p>
                    </div>
                </div>

                {/* ----------------- THE SLIDING OVERLAY (Desktop Only) ----------------- */}
                <div 
                    className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out z-50 bg-primary shadow-2xl
                    ${isSignUp ? '-translate-x-full rounded-br-[150px] rounded-tr-[150px]' : 'translate-x-0 rounded-bl-[150px] rounded-tl-[150px]'}
                    `}
                >
                    <div 
                        className={`relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out flex
                        ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}
                        `}
                    >
                        {/* Overlay Left Panel (Sign In Prompt - Visible when isSignUp is TRUE) */}
                        <div className={`w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-transform duration-700 ease-in-out
                            ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}
                        `}>
                            <img src={Logo} alt="O2Geeks" className="h-12 w-auto mb-8" />
                            <h2 className="text-4xl font-extrabold text-secondary mb-4">Reignite the Spark.</h2>
                            <p className="text-secondary/80 mb-10 text-lg max-w-sm">The digital canvas awaits your return. Log in to continue shaping the extraordinary.</p>
                            <button 
                                onClick={() => setIsSignUp(false)}
                                className="px-12 py-3 rounded-full border-2 border-secondary text-secondary font-bold tracking-wide hover:bg-secondary hover:text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 active:scale-95"
                            >
                                SIGN IN
                            </button>
                        </div>

                        {/* Overlay Right Panel (Sign Up Prompt - Visible when isSignUp is FALSE) */}
                        <div className={`w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-transform duration-700 ease-in-out
                            ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}
                        `}>
                            <img src={Logo} alt="O2Geeks" className="h-12 w-auto mb-8" />
                            <h2 className="text-4xl font-extrabold text-secondary mb-4">Fuel Your Genius.</h2>
                            <p className="text-secondary/80 mb-10 text-lg max-w-sm">Step into the future of content creation. Join O2Geeks and breathe life into your boldest ideas.</p>
                            <button 
                                onClick={() => setIsSignUp(true)}
                                className="px-12 py-3 rounded-full border-2 border-secondary text-secondary font-bold tracking-wide hover:bg-secondary hover:text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 active:scale-95"
                            >
                                SIGN UP
                            </button>
                        </div>
                    </div>
                </div>

            </div>
            
            <p className="absolute bottom-4 text-center text-xs text-muted-foreground w-full">
                 &copy; {new Date().getFullYear()} O2Geeks &middot; Admin Dashboard &middot; Designed by Mian Ameer
            </p>
        </div>
    );
}
