import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar.tsx';
import { TimerProvider } from './context/TimerContext';
import { TimerPage } from './pages/TimerPage';
import { PlannerPage } from './pages/PlannerPage';
import { LogsPage } from './pages/LogsPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
    return (
        <TimerProvider>
            <BrowserRouter>
                <div
                    className="flex flex-col h-screen w-screen overflow-hidden select-none bg-slate-950/80"
                >
                    <Navbar  />

                    <main className="flex-1 overflow-auto relative z-10">
                        <Routes>
                            <Route path="/" element={<Navigate to="/timer" replace />} />
                            <Route path="/timer" element={<TimerPage />} />
                            <Route path="/planner" element={<PlannerPage />} />
                            <Route path="/logs" element={<LogsPage />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="*" element={<Navigate to="/timer" replace />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </TimerProvider>
    );
}

export default App;