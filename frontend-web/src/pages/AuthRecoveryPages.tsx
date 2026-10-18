import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { authService } from '../services/auth-service';

function AuthMessage({ children }: { children: string }) {
    return <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500" role="alert">{children}</p>;
}

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await authService.requestPasswordReset(email);
            setSubmitted(true);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return <AuthLayout mode="recovery"><div className="mb-6"><h2 className="auth-heading">Reset your password</h2><p className="mt-2 text-sm leading-6 text-[var(--app-text-muted)]">Enter your email and we’ll send you a link to choose a new password.</p></div>{submitted ? <div role="status" aria-live="polite"><p className="text-sm leading-6 text-[var(--app-text-muted)]">If an account exists for <span className="font-medium text-[var(--app-text)]">{email}</span>, you’ll receive a password reset email shortly.</p></div> : <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4"><div className="auth-field"><label htmlFor="recovery-email" className="mb-2 block text-xs font-semibold tracking-wide">Email address</label><input id="recovery-email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="auth-input" placeholder="you@example.com" /></div>{error && <AuthMessage>{error}</AuthMessage>}<button type="submit" disabled={isSubmitting || !email} className="auth-submit"><span>{isSubmitting ? 'Sending...' : 'Send reset link'}</span><span aria-hidden="true">↗</span></button></form>}<p className="mt-6 text-center text-xs text-[var(--app-text-muted)]"><Link to="/login" className="font-semibold text-[var(--accent-color)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]">Back to sign in</Link></p></AuthLayout>;
}

export function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!token) { setError('This password reset link is invalid or expired.'); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        setIsSubmitting(true);
        setError('');
        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Please request a new reset link.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return <AuthLayout mode="recovery"><div className="mb-6"><h2 className="auth-heading">Choose a new password</h2><p className="mt-2 text-sm text-[var(--app-text-muted)]">Use at least 6 characters for your new password.</p></div>{success ? <p role="status" className="text-sm leading-6 text-[var(--app-text-muted)]">Your password has been updated. <Link to="/login" className="font-semibold text-[var(--accent-color)] underline-offset-4 hover:underline">Sign in</Link></p> : <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4"><div className="auth-field"><label htmlFor="new-password" className="mb-2 block text-xs font-semibold tracking-wide">New password</label><input id="new-password" name="new-password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="auth-input" /></div><div className="auth-field"><label htmlFor="confirm-new-password" className="mb-2 block text-xs font-semibold tracking-wide">Confirm new password</label><input id="confirm-new-password" name="confirm-new-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="auth-input" /></div>{error && <AuthMessage>{error}</AuthMessage>}<button type="submit" disabled={isSubmitting || !password || !confirmPassword} className="auth-submit"><span>{isSubmitting ? 'Updating...' : 'Update password'}</span><span aria-hidden="true">↗</span></button></form>}</AuthLayout>;
}

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!token) { setStatus('error'); return; }
        let active = true;
        void authService.verifyEmail(token).then(() => {
            if (active) setStatus('success');
        }).catch(() => {
            if (active) setStatus('error');
        });
        return () => { active = false; };
    }, [token]);

    return <AuthLayout mode="recovery"><div role="status" aria-live="polite"><h2 className="auth-heading">{status === 'loading' ? 'Verifying your email' : status === 'success' ? 'Email verified' : 'Verification link unavailable'}</h2><p className="mt-3 text-sm leading-6 text-[var(--app-text-muted)]">{status === 'loading' ? 'Please wait while we confirm your email address.' : status === 'success' ? 'Your email is verified. You can now sign in to StudyZen.' : 'This verification link is invalid or expired. You can request another from your account confirmation screen.'}</p>{status !== 'loading' && <Link to="/login" className="auth-submit mt-6"><span>Go to sign in</span><span aria-hidden="true">↗</span></Link>}</div></AuthLayout>;
}
