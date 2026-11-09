import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Timer, Calendar, BookOpen, BarChart3 } from "lucide-react";

interface DockItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

const DOCK_ITEMS: DockItem[] = [
    { path: "/timer", label: "Timer", icon: Timer },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/subjects", label: "Subjects", icon: BookOpen },
    { path: "/dashboard", label: "Stats", icon: BarChart3 },
];

export const FloatingDock: React.FC = () => {
    const { pathname } = useLocation();

    return (
        <aside
            aria-label="Floating Navigation Dock"
            className="fixed left-1/2 -translate-x-1/2 z-40 lg:hidden select-none"
            style={{
                bottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
            }}
        >
            <nav className="flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-card-bg)]/90 backdrop-blur-2xl shadow-2xl shadow-black/30">
                {DOCK_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        pathname === item.path ||
                        pathname.startsWith(`${item.path}/`);

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            aria-current={isActive ? "page" : undefined}
                            className={[
                                "relative flex flex-col items-center justify-center gap-0.5 rounded-full px-3.5 py-1.5 min-w-[3.75rem] sm:min-w-[4.5rem] text-[11px] font-semibold transition-all duration-200",
                                "active:scale-90 touch-manipulation",
                                isActive
                                    ? "bg-[var(--accent-color)] text-white shadow-md shadow-[var(--accent-color)]/30 font-bold"
                                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-neutral-500/10",
                            ].join(" ")}
                        >
                            <Icon size={18} className="transition-transform duration-200" />
                            <span className="text-[10px] tracking-tight leading-none">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};
