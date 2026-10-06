import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth-service';
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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = async () => {
            const token = authService.getToken();
            const refreshToken = authService.getRefreshToken();
            if (token || refreshToken) {
                try {
                    const userData = await authService.getMe();
                    setUser(userData);
                    localStorage.setItem('studyzen_user', JSON.stringify(userData));
                } catch {
                    authService.logout();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const register = async (credentials: RegisterCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.register(credentials);
            const userData = await authService.getMe();
            setUser(userData);
            localStorage.setItem('studyzen_user', JSON.stringify(userData));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: AuthCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.login(credentials);
            const userData = await authService.getMe();
            setUser(userData);
            localStorage.setItem('studyzen_user', JSON.stringify(userData));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (data: UpdateProfileDTO) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedUser = await authService.updateProfile(data);
            setUser(updatedUser);
            localStorage.setItem('studyzen_user', JSON.stringify(updatedUser));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Update failed';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                register,
                login,
                logout,
                updateProfile,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
