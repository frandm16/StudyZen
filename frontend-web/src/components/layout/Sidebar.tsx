import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
    path: string;
    label: string;
    icon: React.FC<{ className?: string }>;
}

const TimerIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <polyline points="12 7 12 15 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PlannerIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
        <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
    </svg>
);

const LogsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DashboardIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="9" rx="1" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="5" rx="1" strokeWidth="2" />
        <rect x="14" y="12" width="7" height="9" rx="1" strokeWidth="2" />
        <rect x="3" y="16" width="7" height="5" rx="1" strokeWidth="2" />
    </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" strokeWidth="2" />
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);

const ChevronLeftIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const MAIN_NAV_ITEMS: NavItem[] = [
    { path: '/timer', label: 'Temporizador', icon: TimerIcon },
    { path: '/planner', label: 'Planificador', icon: PlannerIcon },
    { path: '/logs', label: 'Historial', icon: LogsIcon },
    { path: '/dashboard', label: 'Estadísticas', icon: DashboardIcon },
];

export const Sidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside
            className={`relative z-20 h-screen flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-white/10 bg-black/40 backdrop-blur-md select-none ${
                isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
            <div>
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/20 shrink-0">
                            S
                        </div>
                        {!isCollapsed && (
                            <span className="font-semibold text-lg text-white tracking-wide truncate">
                StudyZen
              </span>
                        )}
                    </div>

                    <button
                        onClick={() => setIsCollapsed((prev) => !prev)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title={isCollapsed ? 'Expandir menú' : 'Plegar menú'}
                    >
                        <ChevronLeftIcon className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="p-3 space-y-1">
                    {MAIN_NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                                    isActive
                                        ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-600/30 backdrop-blur-sm'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}

                                {isCollapsed && (
                                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-white/10">
                                        {item.label}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="p-3 border-t border-white/10">
                <NavLink
                    to="/settings"
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                        location.pathname === '/settings'
                            ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-600/30'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    title={isCollapsed ? 'Ajustes' : undefined}
                >
                    <SettingsIcon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${location.pathname === '/settings' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                    {!isCollapsed && <span className="truncate">Ajustes</span>}

                    {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-white/10">
                            Ajustes
                        </div>
                    )}
                </NavLink>
            </div>
        </aside>
    );
};