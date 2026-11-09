import React from "react";
import { Link, useLocation } from "react-router-dom";

import { NavbarDesktop } from "./NavbarDesktop";
import { UserProfile } from "./UserProfile";
import { NotificationCenter } from "./NotificationCenter";
import { Logo } from "./NavbarIcons";

export interface NavItem {
    path: string;
    label: string;
}

export const NAV_ITEMS: NavItem[] = [
    { path: "/timer", label: "Timer" },
    { path: "/calendar", label: "Calendar" },
    { path: "/subjects", label: "Subjects" },
    { path: "/dashboard", label: "Stats" },
];

export const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]/50 focus-visible:ring-offset-2";

export const Navbar: React.FC = () => {
    const { pathname } = useLocation();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[var(--app-border)] bg-[var(--app-bg,#fff)]/95 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-3 sm:px-6">
                <div className="relative flex h-14 sm:h-16 lg:grid lg:h-[4.5rem] lg:grid-cols-[1fr_auto_1fr] items-center justify-between">
                    <Link
                        to="/timer"
                        className={`group flex w-fit items-center gap-2 sm:gap-2.5 rounded-xl ${focusRing}`}
                    >
                        <Logo className="h-8 w-8 sm:h-10 sm:w-10 text-[var(--app-text)]" />

                        <span className="font-pt text-[1.25rem] sm:text-[1.5rem] font-bold tracking-[-0.02em] text-[var(--app-text)]">
                            StudyZen
                        </span>
                    </Link>

                    <NavbarDesktop
                        pathname={pathname}
                        items={NAV_ITEMS}
                        focusRing={focusRing}
                    />

                    <div className="flex items-center justify-end gap-1.5 lg:col-start-3">
                        <NotificationCenter />
                        <UserProfile focusRing={focusRing} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
