import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/auth-service';

function GoogleMark() {
    return (
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

export function LoginPage() {
    const notify = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [touched, setTouched] = useState({ email: false, password: false });

    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const emailError = touched.email && (!email ? 'Email is required' : !isValidEmail(email) ? 'Enter a valid email address' : '');
    const passwordError = touched.password && (!password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : '');
    const canSubmit = Boolean(email && password && !emailError && !passwordError && !isLoading);
    const oauthError = searchParams.get('error');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTouched({ email: true, password: true });
        if (!canSubmit) return;
        try {
            await login({ email, password });
            notify({ title: 'Signed in', tone: 'success', persist: false });
            navigate('/');
        } catch (error) {
            notify({ title: 'Login failed', description: error instanceof Error ? error.message : 'Login failed', tone: 'error' });
        }
    };

    return (
        <AuthLayout mode="login">
            <div className="mb-7">
                <h2 className="auth-heading">Welcome back</h2>
                <p className="mt-2 text-sm text-[var(--app-text-muted)]">Sign in to your account.</p>
            </div>

            {oauthError && <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500" role="alert">Sign-in with Google could not be completed. Please try again.</p>}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="auth-field auth-delay-1">
                    <label htmlFor="login-email" className="mb-2 block text-xs font-semibold tracking-wide">Email address</label>
                    <input
                        id="login-email" name="email" type="email" autoComplete="email" inputMode="email" required
                        value={email} onChange={(event) => setEmail(event.target.value)}
                        onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                        placeholder="you@example.com" aria-invalid={Boolean(emailError)} aria-describedby={emailError ? 'login-email-error' : undefined}
                        className={`auth-input ${emailError ? 'auth-input-error' : ''}`}
                    />
                    {emailError && <p id="login-email-error" className="auth-error" role="alert">{emailError}</p>}
                </div>
                <div className="auth-field auth-delay-2">
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label htmlFor="login-password" className="text-xs font-semibold tracking-wide">Password</label>
                                            </div>
                    <input
                        id="login-password" name="password" type="password" autoComplete="current-password" required
                        value={password} onChange={(event) => setPassword(event.target.value)}
                        onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                        placeholder="Enter your password" aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? 'login-password-error' : undefined}
                        className={`auth-input ${passwordError ? 'auth-input-error' : ''}`}
                    />
                    {passwordError && <p id="login-password-error" className="auth-error" role="alert">{passwordError}</p>}
                </div>
                <button type="submit" disabled={!canSubmit} className="auth-submit group auth-delay-3">
                    <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
                    {isLoading ? <span className="auth-spinner" aria-hidden="true" /> : <span className="text-lg transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true">↗</span>}
                </button>
            </form>

            <div className="my-6 flex items-center gap-4" aria-hidden="true">
                <span className="h-px flex-1 bg-[var(--app-border)]" />
                <span className="text-xs text-[var(--app-text-muted)]">or</span>
                <span className="h-px flex-1 bg-[var(--app-border)]" />
            </div>

            <button type="button" onClick={() => { window.location.href = authService.getGoogleAuthUrl(); }} className="auth-google">
                <GoogleMark />
                <span>Continue with Google</span>
            </button>

            <p className="mt-8 text-center text-xs text-[var(--app-text-muted)]">
                New to StudyZen? <Link to="/register" className="font-semibold text-[var(--accent-color)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Create an account <span aria-hidden="true">→</span></Link>
            </p>
        </AuthLayout>
    );
}

export default LoginPage;
