import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { NavbarDesktop } from "./NavbarDesktop";
import { NavbarMobile } from "./NavbarMobile";
import { UserProfile } from "./UserProfile";
import {
    Logo,
    MenuIcon,
} from "./NavbarIcons";

export interface NavItem {
    path: string;
    label: string;
}

export const NAV_ITEMS: NavItem[] = [
    { path: "/timer", label: "Timer" },
    { path: "/day", label: "Day" },
    { path: "/week", label: "Week" },
    { path: "/planner", label: "Planning" },
    { path: "/subjects", label: "Subjects" },
    { path: "/dashboard", label: "Stats" },
];

export const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]/50 focus-visible:ring-offset-2";

export const Navbar: React.FC = () => {
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    useEffect(() => {
        if (!menuOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [menuOpen]);

    return (
        <header className="sticky top-0 z-50 w-full bg-[var(--app-bg,#fff)]/90 backdrop-blur-xl">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="relative grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center">
                    <Link
                        to="/timer"
                        className={`group flex w-fit items-center gap-2.5 rounded-xl ${focusRing}`}
                    >
                        <Logo className="h-10 w-10 text-[var(--app-text)]" />

                        <span className="font-pt text-[1.5rem] font-bold tracking-[-0.02em] text-[var(--app-text)]">
                            StudyZen
                        </span>
                    </Link>

                    <NavbarDesktop
                        pathname={pathname}
                        items={NAV_ITEMS}
                        focusRing={focusRing}
                    />

                    <div className="col-start-3 flex items-center justify-end gap-1.5">
                        <UserProfile focusRing={focusRing} />

                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-nav"
                            className={[
                                "flex h-10 w-10 items-center justify-center rounded-xl",
                                "text-[var(--app-text)] transition-colors",
                                "hover:bg-neutral-500/10",
                                "md:hidden",
                                focusRing,
                            ].join(" ")}
                        >
                            <MenuIcon open={menuOpen} />
                        </button>
                    </div>
                </div>

                <div ref={menuRef}>
                    <NavbarMobile
                        pathname={pathname}
                        open={menuOpen}
                        items={NAV_ITEMS}
                        focusRing={focusRing}
                    />
                </div>
            </div>

            <div className="h-px bg-[var(--app-border)]" />
        </header>
    );
};

export default Navbar;