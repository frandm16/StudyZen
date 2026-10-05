import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth-service';

export function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading, error: contextError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState({ email: false, password: false });

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const emailError = touched.email && (!email ? 'Email is required' : !isValidEmail(email) ? 'Invalid email' : '');
    const passwordError = touched.password && (!password ? 'Password is required' : password.length < 6 ? 'Password must be at least 6 characters' : '');
    const canSubmit = email && password && !emailError && !passwordError && !isLoading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4287f5] to-[#1d4ed8] px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-center text-[#151414] mb-2">StudyZen</h1>
                    <p className="text-center text-neutral-500 text-sm mb-8">Focus on what matters</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#151414] mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => setTouched({ ...touched, email: true })}
                                placeholder="you@example.com"
                                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                                    emailError ? 'border-red-500 bg-red-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                                } text-[#151414] placeholder:text-neutral-400 focus:outline-none focus:border-[#4287f5]`}
                            />
                            {emailError && <p className="text-red-600 text-xs mt-1">{emailError}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#151414] mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setTouched({ ...touched, password: true })}
                                placeholder="••••••••"
                                className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                                    passwordError ? 'border-red-500 bg-red-50' : 'border-neutral-300 bg-white hover:border-neutral-400'
                                } text-[#151414] placeholder:text-neutral-400 focus:outline-none focus:border-[#4287f5]`}
                            />
                            {passwordError && <p className="text-red-600 text-xs mt-1">{passwordError}</p>}
                        </div>

                        {(error || contextError) && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error || contextError}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={`w-full py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                canSubmit
                                    ? 'bg-[#4287f5] text-white hover:bg-[#3073e6] active:scale-95 cursor-pointer'
                                    : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                            }`}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-neutral-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = authService.getGoogleAuthUrl();
                        }}
                        className="w-full mt-4 px-4 py-2.5 rounded-lg border border-neutral-300 bg-white text-[#151414] font-medium hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="mt-6 pt-6 border-t border-neutral-200">
                        <p className="text-center text-sm text-neutral-600">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/register')}
                                className="text-[#4287f5] font-medium hover:underline"
                            >
                                Register here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;