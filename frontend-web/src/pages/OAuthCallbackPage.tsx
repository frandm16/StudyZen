import { useEffect } from 'react';

export function OAuthCallbackPage() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const error = params.get('error');

        if (error) {
            // Error en OAuth
            window.location.href = `/login?error=${encodeURIComponent(error)}`;
            return;
        }

        if (accessToken) {
            localStorage.setItem('studyzen_token', accessToken);
            if (refreshToken) {
                localStorage.setItem('studyzen_refresh_token', refreshToken);
            }
            // Redirigir a /timer
            window.location.href = '/timer';
        } else {
            // No token recibido
            window.location.href = '/login?error=oauth_failed';
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4287f5] to-[#1d4ed8]">
            <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/10 mb-4">
                    <div className="h-6 w-6 bg-gradient-to-r from-[#4287f5] to-[#7c3aed] rounded-full animate-spin" />
                </div>
                <p className="text-white">Completando inicio de sesión...</p>
            </div>
        </div>
    );
}

export default OAuthCallbackPage;
