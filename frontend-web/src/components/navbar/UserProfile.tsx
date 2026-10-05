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
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#4287f5] to-[#7c3aed] text-white font-semibold text-sm transition-all duration-200 hover:shadow-md ${focusRing}`}
                aria-expanded={isOpen}
                aria-label="User menu"
            >
                {initials}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-[#4287f5]/5 to-[#7c3aed]/5">
                        <p className="font-semibold text-[#151414] text-sm">{user.displayName}</p>
                        <p className="text-neutral-500 text-xs mt-1">{user.email}</p>
                    </div>

                    <div className="py-2">
                        <button
                            onClick={handleProfileClick}
                            className="w-full px-4 py-2.5 cursor-pointer text-left text-sm text-[#151414] hover:bg-neutral-50 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            View Profile
                        </button>

                        <button
                            onClick={handleSettingsClick}
                            className="w-full px-4 py-2.5 cursor-pointer text-left text-sm text-[#151414] hover:bg-neutral-50 transition-colors flex items-center gap-2"
                        >
                            <svg
                                className={"h-4 w-4"}
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
                            Settings
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full px-4  py-2.5 cursor-pointer text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-neutral-200 mt-2 pt-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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