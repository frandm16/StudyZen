import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth-service';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../services/api';

function ResendVerification({ email }: { email: string }) {
    const notify = useToast();
    const [isSending, setIsSending] = useState(false);

    const resend = async () => {
        setIsSending(true);
        try {
            await authService.resendVerification(email);
            notify({ title: 'Verification email sent', tone: 'success', persist: false });
        } catch (error) {
            notify({ title: 'Could not resend email', description: getApiErrorMessage(error), tone: 'error' });
        } finally {
            setIsSending(false);
        }
    };

    return <button type="button" onClick={() => void resend()} disabled={isSending} className="mt-6 w-full rounded-xl border border-[var(--app-border)] px-4 py-3 text-sm font-semibold transition-colors hover:border-[var(--accent-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)] disabled:cursor-not-allowed disabled:opacity-50">{isSending ? 'Sending...' : 'Resend verification email'}</button>;
}

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

export function RegisterPage() {
    const { register, isLoading } = useAuth();
    const notify = useToast();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [touched, setTouched] = useState({ displayName: false, email: false, password: false, confirmPassword: false });
    const [pendingEmail, setPendingEmail] = useState('');

    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const displayNameError = touched.displayName && (!displayName ? 'Name is required' : displayName.length < 2 ? 'Name must be at least 2 characters' : '');
    const emailError = touched.email && (!email ? 'Email is required' : !isValidEmail(email) ? 'Enter a valid email address' : '');
    const passwordError = touched.password && (!password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : '');
    const confirmPasswordError = touched.confirmPassword && (!confirmPassword ? 'Confirm password is required' : password !== confirmPassword ? 'Passwords do not match' : '');
    const canSubmit = Boolean(displayName && email && password && confirmPassword && !displayNameError && !emailError && !passwordError && !confirmPasswordError && !isLoading);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTouched({ displayName: true, email: true, password: true, confirmPassword: true });
        if (!canSubmit) return;
        try {
            await register({ email, password, displayName });
            setPendingEmail(email);
            notify({ title: 'Check your email', description: 'Verify your email to finish creating your account.', tone: 'success', persist: false });
        } catch (error) {
            notify({ title: 'Registration failed', description: getApiErrorMessage(error), tone: 'error' });
        }
    };

    if (pendingEmail) {
        return (
            <AuthLayout mode="register">
                <section aria-labelledby="pending-email-title" aria-live="polite">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent-color)]">One more step</p>
                    <h2 id="pending-email-title" className="auth-heading">Check your email</h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]">We sent a verification link to <span className="font-medium text-[var(--app-text)]">{pendingEmail}</span>. Open it to verify your address and finish setting up your account.</p>
                    <ResendVerification email={pendingEmail} />
                    <p className="mt-6 text-center text-xs text-[var(--app-text-muted)]">Already verified? <Link to="/login" className="font-semibold text-[var(--accent-color)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Sign in</Link></p>
                </section>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout mode="register">
            <div className="mb-6">
                <h2 className="auth-heading">Create your account</h2>
                <p className="mt-2 text-sm text-[var(--app-text-muted)]">Set up your StudyZen account.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="auth-field auth-delay-1">
                    <label htmlFor="register-name" className="mb-2 block text-xs font-semibold tracking-wide">Full name</label>
                    <input id="register-name" name="name" type="text" autoComplete="name" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, displayName: true }))} placeholder="Your name" aria-invalid={Boolean(displayNameError)} aria-describedby={displayNameError ? 'register-name-error' : undefined} className={`auth-input ${displayNameError ? 'auth-input-error' : ''}`} />
                    {displayNameError && <p id="register-name-error" className="auth-error" role="alert">{displayNameError}</p>}
                </div>
                <div className="auth-field auth-delay-2">
                    <label htmlFor="register-email" className="mb-2 block text-xs font-semibold tracking-wide">Email address</label>
                    <input id="register-email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, email: true }))} placeholder="you@example.com" aria-invalid={Boolean(emailError)} aria-describedby={emailError ? 'register-email-error' : undefined} className={`auth-input ${emailError ? 'auth-input-error' : ''}`} />
                    {emailError && <p id="register-email-error" className="auth-error" role="alert">{emailError}</p>}
                </div>
                <div className="auth-field auth-delay-3">
                    <label htmlFor="register-password" className="mb-2 block text-xs font-semibold tracking-wide">Password</label>
                    <input id="register-password" name="new-password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, password: true }))} placeholder="At least 6 characters" aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? 'register-password-error' : 'register-password-hint'} className={`auth-input ${passwordError ? 'auth-input-error' : ''}`} />
                    {passwordError ? <p id="register-password-error" className="auth-error" role="alert">{passwordError}</p> : <p id="register-password-hint" className="mt-1.5 text-[10px] text-[var(--app-text-muted)]">Use at least 6 characters.</p>}
                </div>
                <div className="auth-field auth-delay-4">
                    <label htmlFor="register-confirm" className="mb-2 block text-xs font-semibold tracking-wide">Confirm password</label>
                    <input id="register-confirm" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))} placeholder="Type your password again" aria-invalid={Boolean(confirmPasswordError)} aria-describedby={confirmPasswordError ? 'register-confirm-error' : undefined} className={`auth-input ${confirmPasswordError ? 'auth-input-error' : ''}`} />
                    {confirmPasswordError && <p id="register-confirm-error" className="auth-error" role="alert">{confirmPasswordError}</p>}
                </div>
                <button type="submit" disabled={!canSubmit} className="auth-submit group auth-delay-5">
                    <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
                    {isLoading ? <span className="auth-spinner" aria-hidden="true" /> : <span className="text-lg transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true">↗</span>}
                </button>
            </form>

            <div className="my-5 flex items-center gap-4" aria-hidden="true">
                <span className="h-px flex-1 bg-[var(--app-border)]" />
                <span className="text-xs text-[var(--app-text-muted)]">or</span>
                <span className="h-px flex-1 bg-[var(--app-border)]" />
            </div>
            <button type="button" onClick={() => { window.location.href = authService.getGoogleAuthUrl(); }} className="auth-google">
                <GoogleMark />
                <span>Sign up with Google</span>
            </button>
            <p className="mt-6 text-center text-xs text-[var(--app-text-muted)]">
                Already have an account? <Link to="/login" className="font-semibold text-[var(--accent-color)] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Sign in <span aria-hidden="true">→</span></Link>
            </p>
        </AuthLayout>
    );
}

export default RegisterPage;
