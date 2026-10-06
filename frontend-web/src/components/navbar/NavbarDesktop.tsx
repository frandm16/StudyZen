import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import type { NavItem } from "./Navbar";

interface NavbarDesktopProps {
    pathname: string;
    items: NavItem[];
    focusRing: string;
}

interface PillState {
    width: number;
    x: number;
}

export const NavbarDesktop: React.FC<NavbarDesktopProps> = ({
                                                                pathname,
                                                                items,
                                                                focusRing,
                                                            }) => {
    const linksRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

    const [pill, setPill] = useState<PillState>({
        width: 0,
        x: 0,
    });

    useEffect(() => {
        const updatePill = () => {
            const activeItem = items.find(
                (item) =>
                    pathname === item.path ||
                    pathname.startsWith(`${item.path}/`)
            );

            const container = linksRef.current;

            if (!activeItem || !container) return;

            const element = itemRefs.current[activeItem.path];

            if (!element) return;

            const containerRect = container.getBoundingClientRect();
            const itemRect = element.getBoundingClientRect();

            setPill({
                width: itemRect.width,
                x: itemRect.left - containerRect.left,
            });
        };

        updatePill();

        const resizeObserver = new ResizeObserver(updatePill);

        if (linksRef.current) {
            resizeObserver.observe(linksRef.current);
        }

        window.addEventListener("resize", updatePill);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updatePill);
        };
    }, [pathname, items]);

    return (
        <nav
            aria-label="Main navigation"
            className="relative hidden h-10 items-center rounded-full bg-neutral-500/10 p-1 md:flex"
        >
            <div
                ref={linksRef}
                className="relative flex h-full items-center"
            >
                <span
                    aria-hidden="true"
                    className="
                        pointer-events-none absolute inset-y-0
                        rounded-full bg-[var(--app-card-bg,#fff)]
                        shadow-[0_1px_3px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]
                        transition-[transform,width]
                        duration-500
                        ease-[cubic-bezier(0.22,1,0.36,1)]
                        motion-reduce:transition-none
                    "
                    style={{
                        width: pill.width,
                        transform: `translateX(${pill.x}px)`,
                    }}
                />

                {items.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        ref={(element) => {
                            itemRefs.current[item.path] = element;
                        }}
                        className={({ isActive }) =>
                            [
                                "group relative flex h-full items-center rounded-full px-6 font-medium text-xs",
                                "transition-colors duration-300",
                                "motion-reduce:transition-none",
                                focusRing,
                                isActive
                                    ? "text-[var(--app-text)] font-bold"
                                    : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]",
                            ].join(" ")
                        }
                    >
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};