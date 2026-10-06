import React from "react";
import { NavLink } from "react-router-dom";

import type { NavItem } from "./Navbar";

interface NavbarMobileProps {
    pathname: string;
    open: boolean;
    items: NavItem[];
    focusRing: string;
}

export const NavbarMobile: React.FC<NavbarMobileProps> = ({
    pathname,
    open,
    items,
    focusRing,
}) => {
    if (!open) return null;

    return (
        <nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            className="border-t border-[var(--app-border)] pb-4 pt-3 md:hidden"
        >
            <div className="rounded-2xl bg-neutral-500/10 border border-[var(--app-border)] p-1.5 space-y-1">
                {items.map((item) => {
                    const isActive =
                        pathname === item.path ||
                        pathname.startsWith(`${item.path}/`);

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={[
                                "flex min-h-11 items-center rounded-xl px-4 text-xs font-semibold",
                                "transition-all duration-200 motion-reduce:transition-none cursor-pointer",
                                focusRing,
                                isActive
                                    ? "bg-[var(--app-card-bg)] text-[var(--accent-color)] font-bold shadow-sm"
                                    : "text-[var(--app-text-muted)] hover:bg-neutral-500/10 hover:text-[var(--app-text)]",
                            ].join(" ")}
                        >
                            {item.label}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};