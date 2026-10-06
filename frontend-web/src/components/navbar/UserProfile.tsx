import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

interface UserProfileProps {
    focusRing: string;
}

export function UserProfile({ focusRing }: UserProfileProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
        navigate('/login');
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsOpen(false);
    };

    const handleSettingsClick = () => {
        navigate('/settings');
        setIsOpen(false);
    };

    if (!user) return null;

    const initials = user.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const hasAvatar = !!user.avatarUrl && !imageError;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full overflow-hidden transition-all duration-200 border-2 border-[var(--accent-color)]/70 hover:border-[var(--accent-color)] hover:shadow-lg hover:ring-2 hover:ring-[var(--accent-ring)] ${focusRing} ${
                    isOpen ? 'ring-2 ring-[var(--accent-color)] border-[var(--accent-color)] shadow-md scale-105' : ''
                }`}
                aria-expanded={isOpen}
                aria-label="User menu"
            >
                {hasAvatar ? (
                    <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[var(--accent-color)] text-white font-bold text-xs">{initials}</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[var(--app-card-bg)] text-[var(--app-text)] rounded-2xl shadow-2xl border border-[var(--app-border)] z-50 overflow-hidden backdrop-blur-xl">
                    <div className="p-4 border-b border-[var(--app-border)] bg-neutral-500/5 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border-2 border-[var(--accent-color)]/60 bg-neutral-500/10 flex items-center justify-center">
                            {hasAvatar ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.displayName}
                                    onError={() => setImageError(true)}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center bg-[var(--accent-color)] text-white font-bold text-xs">{initials}</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-[var(--app-text)] text-sm truncate">{user.displayName}</p>
                            <p className="text-[var(--app-text-muted)] text-xs truncate mt-0.5">{user.email}</p>
                        </div>
                    </div>

                    <div className="py-2">
                        <button
                            onClick={handleProfileClick}
                            className="w-full px-4 py-2.5 cursor-pointer text-left text-xs font-semibold text-[var(--app-text)] hover:bg-neutral-500/10 hover:text-[var(--accent-color)] transition-colors flex items-center gap-3"
                        >
                            <svg className="w-4 h-4 text-[var(--app-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            View Profile
                        </button>

                        <button
                            onClick={handleSettingsClick}
                            className="w-full px-4 py-2.5 cursor-pointer text-left text-xs font-semibold text-[var(--app-text)] hover:bg-neutral-500/10 hover:text-[var(--accent-color)] transition-colors flex items-center gap-3"
                        >
                            <svg
                                className="h-4 w-4 text-[var(--app-text-muted)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                                <path
                                    strokeWidth={1.7}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                                />
                            </svg>
                            Settings
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 cursor-pointer text-left text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3 border-t border-[var(--app-border)] mt-1 pt-2.5"
                        >
                            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Log out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}