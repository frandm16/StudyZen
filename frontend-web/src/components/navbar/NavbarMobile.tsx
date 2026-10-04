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
            className="border-t border-[#151414]/[0.06] pb-4 pt-3 md:hidden"
        >
            <div className="rounded-2xl bg-[#151414]/[0.035] p-1.5">
                {items.map((item) => {
                    const isActive =
                        pathname === item.path ||
                        pathname.startsWith(`${item.path}/`);

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={[
                                "flex min-h-11 items-center rounded-xl px-4 text-sm font-medium",
                                "transition-all duration-200 motion-reduce:transition-none",
                                focusRing,
                                isActive
                                    ? "bg-white text-[#151414] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                                    : "text-neutral-500 hover:bg-white/70 hover:text-[#151414]",
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