import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/navbar/Navbar.tsx';
import { FloatingDock } from './components/navbar/FloatingDock.tsx';
import { FullscreenClock } from './components/clock/FullscreenClock.tsx';
import { TimerProvider } from './context/TimerContext';
import { AuthProvider } from './context/AuthContext';
import { ClockProvider, useClock } from './context/ClockContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TimerPage } from './pages/TimerPage';
import { CalendarPage } from './pages/CalendarPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { LandingPage } from './pages/LandingPage';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/AuthRecoveryPages';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { isAppSubdomain, isLandingSubdomain, getAppUrl } from './lib/domain';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/auth/callback', '/forgot-password', '/reset-password', '/verify-email'];

function AppContent() {
    const { pathname, search } = useLocation();
    const { isOpen, closeClock } = useClock();
    const showNavbar = !PUBLIC_ROUTES.includes(pathname);
    const isCalendar = pathname === '/calendar';

    useEffect(() => {
        if (isLandingSubdomain() && pathname !== '/') {
            window.location.replace(getAppUrl(pathname + search));
        }
    }, [pathname, search]);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden select-none bg-[var(--app-bg,#0b0f17)] text-[var(--app-text,#f9fafb)] transition-colors duration-200">
            {showNavbar && <Navbar />}

            <main className={`flex-1 min-h-0 relative z-10 ${isCalendar ? 'overflow-hidden flex flex-col' : 'overflow-auto'} ${showNavbar ? 'pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0' : ''}`}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/auth/callback" element={<OAuthCallbackPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />

                    <Route path="/" element={isAppSubdomain() ? <Navigate to="/timer" replace /> : <LandingPage />} />
                    <Route
                        path="/timer"
                        element={
                            <ProtectedRoute>
                                <TimerPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/calendar"
                        element={
                            <ProtectedRoute>
                                <CalendarPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/day"
                        element={<Navigate to="/calendar?view=day" replace />}
                    />
                    <Route
                        path="/week"
                        element={<Navigate to="/calendar?view=week" replace />}
                    />
                    <Route
                        path="/planner"
                        element={<Navigate to="/calendar?view=month" replace />}
                    />
                    <Route
                        path="/subjects"
                        element={
                            <ProtectedRoute>
                                <SubjectsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/logs"
                        element={<Navigate to="/subjects" replace />}
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <SettingsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/timer" replace />} />
                </Routes>
            </main>

            {showNavbar && <FloatingDock />}

            <FullscreenClock isOpen={isOpen} onClose={closeClock} />
        </div>
    );
}

export function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TimerProvider>
                    <ClockProvider>
                        <ToastProvider>
                            <BrowserRouter>
                                <AppContent />
                            </BrowserRouter>
                        </ToastProvider>
                    </ClockProvider>
                </TimerProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
