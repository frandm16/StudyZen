import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
    path: string;
    label: string;
}

const NAV_ITEMS: NavItem[] = [
    { path: '/timer', label: 'Timer' },
    { path: '/planner', label: 'Planner' },
    { path: '/logs', label: 'Logs' },
    { path: '/dashboard', label: 'Stats' },
];

export const Navbar: React.FC = () => {
    const location = useLocation();

    return (
        <header className="w-full h-1/15 border-b border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-40 select-none">
            <div className="w-4/7 h-full  flex items-center justify-between z-40 select-none bg-white p-4">

                <div className="flex h-full items-center gap-3 ">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
                        S
                    </div>
                    <span className="font-bold text-xl text-white tracking-wide">
                      StudyZen
                    </span>
                </div>
    
                <nav className="flex items-center gap-10 h-full ">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`px-6 py-2 rounded-lg text-sm font-normal transition-all duration-200 ${
                                    isActive
                                        ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    <NavLink
                        to="/settings"
                        className={`p-2 rounded-xl border border-white/5 transition-all duration-200 ${
                            location.pathname === '/settings'
                                ? 'bg-slate-800 text-white border-white/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                        title="Settings"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="3" strokeWidth="2" />
                            <path
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                            />
                        </svg>
                    </NavLink>
                </div>
            </div>
        </header>
    );
};