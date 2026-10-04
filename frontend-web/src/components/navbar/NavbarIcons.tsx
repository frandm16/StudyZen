import React from "react";

interface IconProps {
    className?: string;
}

export const Logo: React.FC<IconProps> = ({ className }) => (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="StudyZen">
        <path fill="currentColor" d="M30 22 C23 16 14 15 8 17 V47 C14 45 23 46 30 52 Z" />
        <path fill="currentColor" d="M34 22 C41 16 50 15 56 17 V47 C50 45 41 46 34 52 Z" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
    <svg
        className={className ?? "h-6 w-6"}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="3" strokeWidth="2" />

        <path
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        />
    </svg>
);

interface MenuIconProps {
    open: boolean;
}

export const MenuIcon: React.FC<MenuIconProps> = ({ open }) => (
    <span className="relative flex h-5 w-5 items-center justify-center">
        <span
            className={[
                "absolute h-px w-5 bg-current transition-transform duration-200",
                "motion-reduce:transition-none",
                open ? "rotate-45" : "-translate-y-1.5",
            ].join(" ")}
        />

        <span
            className={[
                "absolute h-px w-5 bg-current transition-opacity duration-200",
                "motion-reduce:transition-none",
                open ? "opacity-0" : "opacity-100",
            ].join(" ")}
        />

        <span
            className={[
                "absolute h-px w-5 bg-current transition-transform duration-200",
                "motion-reduce:transition-none",
                open ? "-rotate-45" : "translate-y-1.5",
            ].join(" ")}
        />
    </span>
);