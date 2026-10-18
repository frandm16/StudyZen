import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth-service';
import { getApiErrorMessage } from '../services/api';
import type { User, AuthCredentials, RegisterCredentials, UpdateProfileDTO } from '../types/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    register: (credentials: RegisterCredentials) => Promise<void>;
    login: (credentials: AuthCredentials) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileDTO) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_CHANNEL = 'studyzen-auth';
type AuthMessage = { type: 'logout' | 'session-expired' };

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(AUTH_CHANNEL);
        const clearSession = () => setUser(null);
        const handleMessage = (event: MessageEvent<AuthMessage>) => {
            if (event.data?.type === 'logout' || event.data?.type === 'session-expired') clearSession();
        };
        const handleSessionExpired = () => {
            clearSession();
            channel?.postMessage({ type: 'session-expired' } satisfies AuthMessage);
        };
        channel?.addEventListener('message', handleMessage);
        window.addEventListener('studyzen:session-expired', handleSessionExpired);
        void authService.getMe().then(setUser).catch(() => setUser(null)).finally(() => setIsLoading(false));
        return () => {
            channel?.removeEventListener('message', handleMessage);
            channel?.close();
            window.removeEventListener('studyzen:session-expired', handleSessionExpired);
        };
    }, []);

    const authenticate = async (operation: () => Promise<void>, fallback: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await operation();
            setUser(await authService.getMe());
        } catch (err) {
            setUser(null);
            const message = getApiErrorMessage(err) || fallback;
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.register(credentials);
            setUser(null);
        } catch (err) {
            const message = getApiErrorMessage(err) || 'Registration failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };
    const login = (credentials: AuthCredentials) => authenticate(() => authService.login(credentials), 'Login failed');

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
        } finally {
            setUser(null);
            setIsLoading(false);
            if (typeof BroadcastChannel !== 'undefined') {
                const channel = new BroadcastChannel(AUTH_CHANNEL);
                channel.postMessage({ type: 'logout' } satisfies AuthMessage);
                channel.close();
            }
        }
    };

    const updateProfile = async (data: UpdateProfileDTO) => {
        setIsLoading(true);
        setError(null);
        try {
            setUser(await authService.updateProfile(data));
        } catch (err) {
            const message = getApiErrorMessage(err) || 'Update failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, error, register, login, logout, updateProfile, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
