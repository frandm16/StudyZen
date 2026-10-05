import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/navbar/Navbar.tsx';
import { TimerProvider } from './context/TimerContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TimerPage } from './pages/TimerPage';
import { PlannerPage } from './pages/PlannerPage';
import { LogsPage } from './pages/LogsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { DayPage } from "./pages/DayPage";
import { WeekPage } from "./pages/WeekPage.tsx";
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback'];

function AppContent() {
    const { pathname } = useLocation();
    const showNavbar = !PUBLIC_ROUTES.includes(pathname);

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden select-none bg-[#f5ede6]">
            {showNavbar && <Navbar />}

            <main className="flex-1 overflow-auto relative z-10">
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/auth/callback" element={<OAuthCallbackPage />} />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Navigate to="/timer" replace />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/timer"
                        element={
                            <ProtectedRoute>
                                <TimerPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/day"
                        element={
                            <ProtectedRoute>
                                <DayPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/week"
                        element={
                            <ProtectedRoute>
                                <WeekPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/planner"
                        element={
                            <ProtectedRoute>
                                <PlannerPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/logs"
                        element={
                            <ProtectedRoute>
                                <LogsPage />
                            </ProtectedRoute>
                        }
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
        </div>
    );
}

export function App() {
    return (
        <AuthProvider>
            <TimerProvider>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </TimerProvider>
        </AuthProvider>
    );
}

export default App;