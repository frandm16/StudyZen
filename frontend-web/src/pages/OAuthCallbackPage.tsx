import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth-service';

export function OAuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
            return;
        }
        let active = true;
        void authService.getMe().then(() => {
            if (active) navigate('/timer', { replace: true });
        }).catch(() => {
            if (active) navigate('/login', { replace: true });
        });
        return () => { active = false; };
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4287f5] to-[#1d4ed8]">
            <div className="text-center" role="status" aria-live="polite">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/10 mb-4">
                    <div className="h-6 w-6 bg-gradient-to-r from-[#4287f5] to-[#7c3aed] rounded-full animate-spin" />
                </div>
                <p className="text-white">Completing sign in...</p>
            </div>
        </div>
    );
}

export default OAuthCallbackPage;
