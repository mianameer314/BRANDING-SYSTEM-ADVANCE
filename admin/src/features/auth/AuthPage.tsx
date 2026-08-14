import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { 
    useLogin, 
    useRegister, 
    useVerifyEmail, 
    useResendOtp, 
    useForgotPassword, 
    useResetPassword 
} from './hooks';
import axios from 'axios';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '@/assets/logo.svg';
import { OtpInput } from './components/OtpInput';

type AuthView = 'login' | 'register' | 'otp' | 'forgot' | 'reset';

function validatePassword(password: string): string | null {
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/\d/.test(password)) return 'Password must contain at least one digit.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one symbol.';
    return null;
}

export function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login: authLogin } = useAuth();
    
    // View state
    const [view, setView] = useState<AuthView>(location.pathname === '/register' ? 'register' : 'login');
    const isSignUp = view === 'register' || view === 'otp'; // Controls the slider

    // Sync URL if state changes directly via buttons
    useEffect(() => {
        const path = (view === 'register' || view === 'otp') ? '/register' : '/login';
        if (location.pathname !== path) {
            navigate(path, { replace: true });
        }
    }, [view, navigate, location.pathname]);

    // ---- States ----
    // Login
    const { mutate: loginMutate, isPending: isLoginPending } = useLogin();
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Register
    const { mutate: registerMutate, isPending: isRegisterPending } = useRegister();
    const [regFullName, setRegFullName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
    const [regError, setRegError] = useState('');
    
    // Verify OTP
    const { mutate: verifyMutate, isPending: isVerifyPending } = useVerifyEmail();
    const { mutate: resendMutate, isPending: isResendPending } = useResendOtp();
    const [otpError, setOtpError] = useState('');
    const [otpSuccess, setOtpSuccess] = useState('');

    // Forgot Password
    const { mutate: forgotMutate, isPending: isForgotPending } = useForgotPassword();
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');

    // Reset Password
    const { mutate: resetMutate, isPending: isResetPending } = useResetPassword();
    const [resetOtp, setResetOtp] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [resetConfirm, setResetConfirm] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetError, setResetError] = useState('');

    // ---- Handlers ----
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
                        if (detail === 'Account is deactivated' || detail === 'Email not verified') {
                            // If they need verification, send them to OTP view
                            setRegEmail(loginEmail);
                            setView('otp');
                            resendMutate({ email: loginEmail, purpose: 'signup' });
                        } else {
                            setLoginError(typeof detail === 'string' ? detail : 'Invalid email or password.');
                        }
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

        if (regPassword !== regConfirmPassword) {
            setRegError('Passwords do not match.');
            return;
        }

        const passwordError = validatePassword(regPassword);
        if (passwordError) {
            setRegError(passwordError);
            return;
        }

        registerMutate(
            { full_name: regFullName, email: regEmail, password: regPassword },
            {
                onSuccess: () => {
                    setOtpError('');
                    setOtpSuccess('');
                    setView('otp');
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

    const handleVerifyOtp = (code: string) => {
        setOtpError('');
        verifyMutate(
            { email: regEmail, otp_code: code },
            {
                onSuccess: async () => {
                    setOtpSuccess('Verified! Redirecting to login...');
                    setTimeout(() => {
                        setRegEmail('');
                        setRegPassword('');
                        setRegConfirmPassword('');
                        setRegFullName('');
                        setOtpSuccess('');
                        setView('login');
                    }, 2500); // Wait for the cascading animation to finish
                },
                onError: (err) => {
                    if (axios.isAxiosError(err)) {
                        const detail = err.response?.data?.detail;
                        setOtpError(typeof detail === 'string' ? detail : 'Invalid code.');
                    } else {
                        setOtpError('Verification failed.');
                    }
                }
            }
        );
    };

    const handleResendOtp = (purpose: 'signup' | 'reset', email: string) => {
        setOtpError('');
        setOtpSuccess('');
        resendMutate(
            { email, purpose },
            {
                onSuccess: () => {
                    setOtpSuccess('A new code has been sent.');
                    setTimeout(() => setOtpSuccess(''), 3000);
                },
                onError: () => {
                    setOtpError('Failed to resend code.');
                }
            }
        );
    };

    const handleForgotSubmit = (e: FormEvent) => {
        e.preventDefault();
        setForgotError('');
        forgotMutate(
            { email: forgotEmail },
            {
                onSuccess: () => {
                    setResetOtp('');
                    setResetPassword('');
                    setResetConfirm('');
                    setView('reset');
                },
                onError: (err) => {
                    if (axios.isAxiosError(err)) {
                        const detail = err.response?.data?.detail;
                        setForgotError(typeof detail === 'string' ? detail : 'Failed to send reset email.');
                    } else {
                        setForgotError('Something went wrong.');
                    }
                }
            }
        );
    };

    const handleResetSubmit = (e: FormEvent) => {
        e.preventDefault();
        setResetError('');

        if (resetPassword !== resetConfirm) {
            setResetError('Passwords do not match.');
            return;
        }

        const passwordError = validatePassword(resetPassword);
        if (passwordError) {
            setResetError(passwordError);
            return;
        }

        resetMutate(
            { email: forgotEmail, otp_code: resetOtp, new_password: resetPassword },
            {
                onSuccess: () => {
                    setLoginEmail(forgotEmail);
                    setLoginPassword('');
                    setView('login');
                    // We could show a toast here
                },
                onError: (err) => {
                    if (axios.isAxiosError(err)) {
                        const detail = err.response?.data?.detail;
                        setResetError(typeof detail === 'string' ? detail : 'Reset failed.');
                    } else {
                        setResetError('Something went wrong.');
                    }
                }
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
                
                {/* ----------------- LEFT SIDE (Login, Forgot, Reset) ----------------- */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full bg-card transition-all duration-700 ease-in-out
                    ${isSignUp ? 'md:translate-x-full md:opacity-0 md:z-10 hidden md:block' : 'md:translate-x-0 md:opacity-100 z-20 block'}
                `}>
                    <div className="h-full flex flex-col items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
                        
                        {/* VIEW: LOGIN */}
                        {view === 'login' && (
                            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
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
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-medium text-foreground">Password</label>
                                            <button 
                                                type="button" 
                                                onClick={() => setView('forgot')}
                                                className="text-xs text-primary font-medium hover:underline"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
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
                                    Don't have an account? <button onClick={() => setView('register')} className="text-primary font-bold hover:underline">Sign up</button>
                                </p>
                            </div>
                        )}

                        {/* VIEW: FORGOT PASSWORD */}
                        {view === 'forgot' && (
                            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
                                <button 
                                    onClick={() => setView('login')}
                                    className="absolute top-8 left-8 p-2 rounded-full hover:bg-accent transition text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h1 className="text-3xl font-bold text-foreground mb-2 mt-4">Reset Password</h1>
                                <p className="text-sm text-muted-foreground mb-8 text-center max-w-[280px]">
                                    Enter your email address and we'll send you a 6-digit code.
                                </p>

                                <form onSubmit={handleForgotSubmit} className="w-full max-w-sm space-y-4" noValidate>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-foreground">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            placeholder="you@o2geeks.com"
                                            className="w-full rounded-xl border border-border bg-accent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    {forgotError && (
                                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                            {forgotError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isForgotPending || !forgotEmail}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-secondary shadow-lg shadow-primary/20 transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:pointer-events-none"
                                    >
                                        {isForgotPending ? (
                                            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" /> Sending...</>
                                        ) : 'SEND RESET CODE'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* VIEW: RESET PASSWORD (OTP + NEW PASS) */}
                        {view === 'reset' && (
                            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
                                <button 
                                    onClick={() => setView('login')}
                                    className="absolute top-8 left-8 p-2 rounded-full hover:bg-accent transition text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <h1 className="text-3xl font-bold text-foreground mb-2 mt-4">Create New Password</h1>
                                <p className="text-sm text-muted-foreground mb-6 text-center max-w-[280px]">
                                    Enter the 6-digit code sent to <span className="font-semibold text-foreground">{forgotEmail}</span> and your new password.
                                </p>

                                <form onSubmit={handleResetSubmit} className="w-full max-w-sm space-y-4" noValidate>
                                    <div className="space-y-3 mb-6">
                                        <label className="block text-sm font-medium text-foreground text-center">Reset Code</label>
                                        <OtpInput 
                                            length={6} 
                                            onComplete={(code) => setResetOtp(code)} 
                                            onChange={(code) => setResetOtp(code)}
                                            hasError={!!resetError}
                                            disabled={isResetPending}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-foreground">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showResetPassword ? 'text' : 'password'}
                                                required
                                                value={resetPassword}
                                                onChange={(e) => setResetPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full rounded-xl border border-border bg-accent py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowResetPassword(!showResetPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                            >
                                                {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
                                        <input
                                            type={showResetPassword ? 'text' : 'password'}
                                            required
                                            value={resetConfirm}
                                            onChange={(e) => setResetConfirm(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full rounded-xl border border-border bg-accent py-3 pl-4 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    {resetError && (
                                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive mt-2">
                                            {resetError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isResetPending || resetOtp.length < 6}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-secondary shadow-lg shadow-primary/20 transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:pointer-events-none"
                                    >
                                        {isResetPending ? (
                                            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" /> Updating...</>
                                        ) : 'UPDATE PASSWORD'}
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                </div>

                {/* ----------------- RIGHT SIDE (Register, OTP) ----------------- */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full bg-card transition-all duration-700 ease-in-out
                    ${isSignUp ? 'md:translate-x-full md:opacity-100 z-20 block' : 'md:translate-x-0 md:opacity-0 md:z-10 hidden md:block'}
                `}>
                    <div className="h-full flex flex-col items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
                        
                        {/* VIEW: REGISTER */}
                        {view === 'register' && (
                            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
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
                                            placeholder="Enter your name"
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
                                            placeholder="Enter your email"
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

                                    <button
                                        type="submit"
                                        disabled={isRegisterPending}
                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-secondary shadow-lg shadow-primary/20 transition-all duration-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:pointer-events-none"
                                    >
                                        {isRegisterPending ? (
                                            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary" /> Creating…</>
                                        ) : 'CONTINUE'}
                                    </button>
                                </form>

                                {/* Mobile only toggle */}
                                <p className="mt-6 text-sm text-muted-foreground md:hidden">
                                    Already have an account? <button onClick={() => setView('login')} className="text-primary font-bold hover:underline">Sign in</button>
                                </p>
                            </div>
                        )}

                        {/* VIEW: OTP (Email Verification) */}
                        {view === 'otp' && (
                            <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
                                <h1 className="text-3xl font-bold text-foreground mb-2 mt-4">Verify Email</h1>
                                <p className="text-sm text-muted-foreground mb-8 text-center max-w-[280px]">
                                    We've sent a 6-digit verification code to <br/>
                                    <span className="font-semibold text-foreground">{regEmail}</span>.
                                </p>

                                <div className="w-full max-w-sm space-y-6">
                                    <OtpInput 
                                        length={6} 
                                        onComplete={handleVerifyOtp} 
                                        hasError={!!otpError}
                                        isSuccess={!!otpSuccess}
                                        disabled={isVerifyPending || !!otpSuccess}
                                    />

                                    {otpError && (
                                        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
                                            {otpError}
                                        </div>
                                    )}

                                    {otpSuccess && (
                                        <div className="rounded-lg border border-o2-green/30 bg-o2-green/10 px-4 py-3 text-sm text-o2-green text-center font-medium">
                                            {otpSuccess}
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col items-center gap-2 mt-8">
                                        <button
                                            onClick={() => handleResendOtp('signup', regEmail)}
                                            disabled={isResendPending || isVerifyPending}
                                            className="text-sm text-muted-foreground hover:text-primary transition disabled:opacity-50"
                                        >
                                            {isResendPending ? 'Sending...' : "Didn't receive a code? Resend"}
                                        </button>
                                        
                                        <button
                                            onClick={() => setView('register')}
                                            className="text-sm text-muted-foreground hover:text-foreground transition underline mt-4"
                                        >
                                            Change email address
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                onClick={() => setView('login')}
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
                                onClick={() => setView('register')}
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
