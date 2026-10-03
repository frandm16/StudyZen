import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

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

export default function Logo({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 64 64" className={className} role="img" aria-label="StudyZen">
            <path fill="currentColor" d="M30 22 C23 16 14 15 8 17 V47 C14 45 23 46 30 52 Z" />
            <path fill="currentColor" d="M34 22 C41 16 50 15 56 17 V47 C50 45 41 46 34 52 Z" />
        </svg>
    );
}

export const Navbar: React.FC = () => {
    const location = useLocation();

    // @ts-ignore
    return (
        <header className="w-full h-16 flex items-center justify-center z-40 select-none">
            <div className="w-full h-full flex items-center justify-center px-4 z-40 select-none gap-[clamp(1rem,10vw,15.75rem)]">

                <div className="flex h-full items-center gap-3 ">
                    <Link to="/timer" aria-label="Ir a Timer" className="group flex h-full items-center gap-3">
                        <Logo className="w-12 h-12 text-[#151414] " />
                        <span className="font-pt font-bold text-xl text-[#151414] tracking-wide">
                            StudyZen
                        </span>
                    </Link>
                </div>

                <nav className="flex items-center gap-10 h-full">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                [
                                    "relative flex items-center px-6 py-2 font-normal transition-colors ",
                                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#151414] after:content-['']",
                                    "after:origin-center after:transition-transform after:duration-200 after:ease-out motion-reduce:after:transition-none",
                                    isActive
                                        ? "text-[#151414] after:scale-x-100"
                                        : "text-neutral-500 hover:text-[#151414] after:scale-x-0 hover:after:scale-x-100",
                                ].join(" ")
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <NavLink
                        to="/settings"
                        className={`p-2 rounded-xl border transition-all duration-200 ${
                            location.pathname === '/settings'
                                ? 'text-[#151414] border-[#151414]'
                                : 'text-neutral-500 hover:text-[#151414]'
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