import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTimerContext } from '../context/TimerContext';
import { useBackground } from '../hooks/useBackground';
import { useTheme, THEME_PRESETS, type ColorTheme } from '../context/ThemeContext';
import { AVATAR_PRESETS, getRandomAvatarPreset, type AvatarPreset } from '../lib/avatar-presets';
import { settingsService } from '../services/settings-service';
import type { UpdateProfileDTO } from '../types/auth';
import type { SoundCategory } from '../hooks/useSound';
import {
    User as UserIcon,
    Key,
    Volume2,
    Palette,
    Timer as TimerIcon,
    Clock,
    Watch,
    Code,
    Check,
    AlertCircle,
    Play,
    RotateCcw,
    Upload,
    Calendar as CalendarIcon,
    Award,
    Shuffle,
    Grid,
    X,
    Sun,
    Moon,
} from 'lucide-react';

type TabType =
    | 'profile-details'
    | 'security'
    | 'pomodoro'
    | 'countdown'
    | 'stopwatch'
    | 'appearance'
    | 'calendar'
    | 'grades'
    | 'sound'
    | 'developer';

interface SidebarGroup {
    title: string;
    items: {
        id: TabType;
        label: string;
        breadcrumb: string;
        description: string;
        icon: React.ComponentType<{ className?: string }>;
    }[];
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
    {
        title: 'ACCOUNT',
        items: [
            {
                id: 'profile-details',
                label: 'Profile details',
                breadcrumb: 'Settings / Profile details',
                description: 'Your name, handle, photo, and bio are used on your profile and in friend views.',
                icon: UserIcon,
            },
            {
                id: 'security',
                label: 'Security & Auth',
                breadcrumb: 'Settings / Security',
                description: 'Manage your password and security credentials.',
                icon: Key,
            },
        ],
    },
    {
        title: 'TIMER & MODES',
        items: [
            {
                id: 'pomodoro',
                label: 'Pomodoro Timer',
                breadcrumb: 'Settings / Pomodoro',
                description: 'Customize work intervals, short breaks, long breaks, and auto-start behavior.',
                icon: TimerIcon,
            },
            {
                id: 'countdown',
                label: 'Countdown Timer',
                breadcrumb: 'Settings / Countdown',
                description: 'Configure default duration and quick preset timers.',
                icon: Clock,
            },
            {
                id: 'stopwatch',
                label: 'Stopwatch',
                breadcrumb: 'Settings / Stopwatch',
                description: 'Customize lap recording, continuous study targets, and break tracking.',
                icon: Watch,
            },
        ],
    },
    {
        title: 'APPEARANCE',
        items: [
            {
                id: 'appearance',
                label: 'Theme & Accent',
                breadcrumb: 'Settings / Appearance',
                description: 'Customize color modes, accent themes, video backgrounds, and fonts.',
                icon: Palette,
            },
        ],
    },
    {
        title: 'ACADEMIC',
        items: [
            {
                id: 'calendar',
                label: 'Calendar & Schedule',
                breadcrumb: 'Settings / Calendar',
                description: 'Set your week starting day and default session defaults.',
                icon: CalendarIcon,
            },
            {
                id: 'grades',
                label: 'Grades & Pass Scale',
                breadcrumb: 'Settings / Grades',
                description: 'Configure academic grade scale limits and pass score thresholds.',
                icon: Award,
            },
        ],
    },
    {
        title: 'NOTIFICATIONS',
        items: [
            {
                id: 'sound',
                label: 'Sound & Volumes',
                breadcrumb: 'Settings / Notifications',
                description: 'Adjust audio volumes, alarm presets, and notification tones.',
                icon: Volume2,
            },
        ],
    },
    {
        title: 'SYSTEM',
        items: [
            {
                id: 'developer',
                label: 'Developer API & Cache',
                breadcrumb: 'Settings / Developer API',
                description: 'Technical environment information and cache diagnostics.',
                icon: Code,
            },
        ],
    },
];

const ALL_THEME_KEYS: ColorTheme[] = [
    'default',
    'glacier',
    'dusk',
    'fern',
    'blaze',
    'solar',
    'sakura',
    'mocha',
];

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, description }) => {
    return (
        <div
            onClick={() => onChange(!checked)}
            className="flex items-center justify-between p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] cursor-pointer hover:border-[var(--accent-color)]/40 transition-all select-none group"
            role="switch"
            aria-checked={checked}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    onChange(!checked);
                }
            }}
        >
            <div className="pr-4">
                <p className="text-xs font-bold text-[var(--app-text)] group-hover:text-[var(--accent-color)] transition-colors">{label}</p>
                <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">{description}</p>
            </div>
            <div
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    checked ? 'bg-[var(--accent-color)] shadow-sm' : 'bg-neutral-500/25'
                }`}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </div>
        </div>
    );
};

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('profile-details');
    const { user, updateProfile, isLoading, error: authContextError } = useAuth();
    const timer = useTimerContext();
    const bg = useBackground();
    const sound = timer.sound;
    const { colorMode, colorTheme, setColorMode, setColorTheme } = useTheme();

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [username, setUsername] = useState(user?.username || (user?.email ? user.email.split('@')[0] : ''));
    const [bio, setBio] = useState(user?.bio || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_PRESETS[0].url);
    const [avatarTitle, setAvatarTitle] = useState('Dolphin Avatar');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [weekStartsOn, setWeekStartsOn] = useState(1);
    const [gradeScaleMax, setGradeScaleMax] = useState('10.0');
    const [passGrade, setPassGrade] = useState('5.0');
    const [stopwatchTargetHours, setStopwatchTargetHours] = useState(2);
    const [enableLapRecording, setEnableLapRecording] = useState(true);

    const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
    const [accountError, setAccountError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setUsername(user.username || (user.email ? user.email.split('@')[0] : ''));
            setBio(user.bio || '');
            setEmail(user.email || '');
            if (user.avatarUrl) {
                setAvatarUrl(user.avatarUrl);
                const matchedPreset = AVATAR_PRESETS.find((p) => p.url === user.avatarUrl);
                setAvatarTitle(matchedPreset ? matchedPreset.name : 'Custom Photo');
            }
        }
    }, [user]);

    useEffect(() => {
        const fetchBackendSettings = async () => {
            try {
                const s = await settingsService.getSettings();
                if (s.weekStartsOn !== undefined) setWeekStartsOn(s.weekStartsOn);
                if (s.gradeScaleMax !== undefined) setGradeScaleMax(String(s.gradeScaleMax));
                if (s.passGrade !== undefined) setPassGrade(String(s.passGrade));
                if (s.stopwatchTargetHours !== undefined) setStopwatchTargetHours(s.stopwatchTargetHours);
                if (s.pomodoroWorkMinutes && s.pomodoroWorkMinutes !== timer.workMinutes) {
                    timer.setWorkMinutes(s.pomodoroWorkMinutes);
                }
                if (s.pomodoroShortBreakMinutes && s.pomodoroShortBreakMinutes !== timer.shortBreakMinutes) {
                    timer.setShortBreakMinutes(s.pomodoroShortBreakMinutes);
                }
                if (s.pomodoroLongBreakMinutes && s.pomodoroLongBreakMinutes !== timer.longBreakMinutes) {
                    timer.setLongBreakMinutes(s.pomodoroLongBreakMinutes);
                }
                if (s.pomodoroSessionsInterval && s.pomodoroSessionsInterval !== timer.sessionsUntilLongBreak) {
                    timer.setSessionsUntilLongBreak(s.pomodoroSessionsInterval);
                }
                if (s.countdownDefaultMinutes && s.countdownDefaultMinutes !== timer.countdownMinutes) {
                    timer.setCountdownMinutes(s.countdownDefaultMinutes);
                }
                if (s.autoStartBreaks !== undefined) timer.setAutoStartBreaks(s.autoStartBreaks);
                if (s.autoStartWork !== undefined) timer.setAutoStartWork(s.autoStartWork);
                if (s.countBreakTime !== undefined) timer.setCountBreakTime(s.countBreakTime);
            } catch {
            }
        };

        void fetchBackendSettings();
    }, []);

    const activeItem = SIDEBAR_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab)!;

    const handleApplyAvatar = async (nextUrl: string, title: string) => {
        setAvatarUrl(nextUrl);
        setAvatarTitle(title);
        try {
            await updateProfile({ avatarUrl: nextUrl });
            setAccountSuccess('Avatar updated successfully');
        } catch {
            setAccountError('Could not save avatar');
        }
    };

    const handleShuffleAvatar = () => {
        const randomPreset = getRandomAvatarPreset();
        void handleApplyAvatar(randomPreset.url, randomPreset.name);
    };

    const handleSelectAvatarPreset = (preset: AvatarPreset) => {
        setIsAvatarModalOpen(false);
        void handleApplyAvatar(preset.url, preset.name);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const dataUrl = event.target.result as string;
                    void handleApplyAvatar(dataUrl, 'Uploaded Photo');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAccountError(null);
        setAccountSuccess(null);

        try {
            const updateData: UpdateProfileDTO = {
                displayName,
                username,
                bio,
                email,
                avatarUrl,
            };

            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    setAccountError('Passwords do not match');
                    return;
                }
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }

            await updateProfile(updateData);
            setAccountSuccess('Profile updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setAccountError(err instanceof Error ? err.message : 'Failed to update profile');
        }
    };

    const handleTimerChange = (key: string, value: number | boolean) => {
        if (key === 'workMinutes') timer.setWorkMinutes(value as number);
        if (key === 'shortBreakMinutes') timer.setShortBreakMinutes(value as number);
        if (key === 'longBreakMinutes') timer.setLongBreakMinutes(value as number);
        if (key === 'sessionsUntilLongBreak') timer.setSessionsUntilLongBreak(value as number);
        if (key === 'countdownMinutes') timer.setCountdownMinutes(value as number);
        if (key === 'autoStartBreaks') timer.setAutoStartBreaks(value as boolean);
        if (key === 'autoStartWork') timer.setAutoStartWork(value as boolean);
        if (key === 'countBreakTime') timer.setCountBreakTime(value as boolean);

        const payload: Record<string, unknown> = {};
        if (key === 'workMinutes') payload.pomodoroWorkMinutes = value;
        if (key === 'shortBreakMinutes') payload.pomodoroShortBreakMinutes = value;
        if (key === 'longBreakMinutes') payload.pomodoroLongBreakMinutes = value;
        if (key === 'sessionsUntilLongBreak') payload.pomodoroSessionsInterval = value;
        if (key === 'countdownMinutes') payload.countdownDefaultMinutes = value;
        if (key === 'autoStartBreaks') payload.autoStartBreaks = value;
        if (key === 'autoStartWork') payload.autoStartWork = value;
        if (key === 'countBreakTime') payload.countBreakTime = value;

        void settingsService.patchSettings(payload).catch(() => {});
    };

    const handleAcademicSave = async () => {
        try {
            await settingsService.patchSettings({
                weekStartsOn,
                gradeScaleMax: Number(gradeScaleMax),
                passGrade: Number(passGrade),
            });
            setAccountSuccess('Academic settings saved successfully');
        } catch {
            setAccountError('Failed to save academic settings');
        }
    };

    return (
        <div className="min-h-[calc(100vh-4.5rem)] bg-[var(--app-bg)] text-[var(--app-text)] p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
            <div className="mx-auto max-w-6xl space-y-4">
                
                <div className="flex items-center gap-2 text-xs font-medium text-[var(--app-text-muted)]">
                    <span>Settings</span>
                    <span>/</span>
                    <span className="text-[var(--accent-color)] font-semibold">{activeItem.label}</span>
                </div>

                <div className="flex flex-col md:flex-row bg-[var(--app-card-bg)] rounded-3xl border border-[var(--app-border)] shadow-2xl overflow-hidden min-h-[680px] transition-colors duration-200">
                    
                    <aside className="w-full md:w-64 bg-neutral-500/5 border-r border-b md:border-b-0 border-[var(--app-border)] p-5 flex flex-col justify-between shrink-0">
                        <div>
                            <div className="mb-6 px-1">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)] block mb-1">General</span>
                                <h1 className="text-2xl font-extrabold text-[var(--app-text)] tracking-tight">Settings</h1>
                            </div>

                            <nav className="space-y-6" aria-label="Settings categories">
                                {SIDEBAR_GROUPS.map((group) => (
                                    <div key={group.title} className="space-y-1.5">
                                        <h2 className="px-2 text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-widest">
                                            {group.title}
                                        </h2>
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveTab(item.id)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                                                        isActive
                                                            ? 'bg-[var(--accent-color)]/15 text-[var(--accent-color)] border border-[var(--accent-color)]/30 shadow-md font-bold'
                                                            : 'text-[var(--app-text-muted)] hover:bg-neutral-500/10 hover:text-[var(--app-text)]'
                                                    }`}
                                                >
                                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent-color)]' : 'text-[var(--app-text-muted)]'}`} />
                                                    <span className="flex-1 truncate">{item.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {user && (
                            <div className="mt-8 pt-4 border-t border-[var(--app-border)] px-1 flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 bg-neutral-500/10 border border-[var(--app-border)] flex items-center justify-center text-white text-xs font-bold">
                                    <img src={avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-[var(--app-text)] truncate">{user.displayName}</p>
                                    <p className="text-[11px] text-[var(--app-text-muted)] truncate">@{username}</p>
                                </div>
                            </div>
                        )}
                    </aside>

                    <main className="flex-1 flex flex-col min-w-0 bg-[var(--app-card-bg)]">
                        
                        <header className="px-6 py-5 border-b border-[var(--app-border)] bg-[var(--app-card-bg)]">
                            <p className="text-xs font-semibold text-[var(--app-text-muted)]">{SIDEBAR_GROUPS.find((g) => g.items.some((i) => i.id === activeTab))?.title}</p>
                            <h2 className="text-2xl font-bold text-[var(--app-text)] mt-0.5">{activeItem.label}</h2>
                            <p className="text-xs text-[var(--app-text-muted)] mt-1 max-w-xl">{activeItem.description}</p>
                        </header>

                        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-8">
                            
                            {activeTab === 'profile-details' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-8 max-w-4xl">
                                    
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] flex flex-col lg:flex-row gap-8 items-start justify-between">
                                        
                                        <div className="space-y-5 flex-1 w-full">
                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                    Display name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    placeholder="fran dorado"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)] transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                    Username
                                                </label>
                                                <div className="flex gap-2">
                                                    <div className="flex items-center px-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text-muted)] text-sm font-semibold">
                                                        @
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        placeholder="frandm16"
                                                        className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)] transition-all"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleProfileSubmit}
                                                        className="px-4 py-2.5 rounded-xl bg-neutral-500/20 text-[var(--app-text)] hover:bg-neutral-500/30 text-xs font-semibold transition-all border border-[var(--app-border)]"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                                <p className="text-[11px] text-[var(--app-text-muted)] mt-1">
                                                    3-24 characters: letters, numbers, underscores, and hyphens.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="you@example.com"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)] transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                    Bio
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    placeholder="Optional note shown on your profile."
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)] transition-all resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="w-full lg:w-80 bg-[var(--app-bg)] rounded-2xl p-5 border border-[var(--app-border)] flex flex-col justify-between shrink-0 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-20 w-20 rounded-2xl overflow-hidden bg-neutral-500/10 border border-[var(--app-border)] shrink-0 flex items-center justify-center">
                                                    <img src={avatarUrl} alt={avatarTitle} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[var(--app-text)] text-sm truncate">{avatarTitle}</p>
                                                    <p className="text-[11px] text-[var(--app-text-muted)] mt-1 leading-relaxed">
                                                        Static animal avatars are picked from the local StudyZen library.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2">
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleShuffleAvatar}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs hover:opacity-90 transition-all shadow-md"
                                                    >
                                                        <Shuffle className="w-3.5 h-3.5" /> Shuffle
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setIsAvatarModalOpen(true)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-neutral-500/10 text-[var(--app-text)] font-semibold text-xs hover:bg-neutral-500/20 transition-all border border-[var(--app-border)]"
                                                    >
                                                        <Grid className="w-3.5 h-3.5" /> Choose avatar
                                                    </button>
                                                </div>

                                                <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-neutral-500/10 text-[var(--app-text)] font-semibold text-xs hover:bg-neutral-500/20 transition-all cursor-pointer border border-[var(--app-border)]">
                                                    <Upload className="w-3.5 h-3.5" /> Upload photo
                                                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {(accountError || authContextError) && (
                                        <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium">
                                            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                                            <span>{accountError || authContextError}</span>
                                        </div>
                                    )}

                                    {accountSuccess && (
                                        <div className="flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-medium">
                                            <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                                            <span>{accountSuccess}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[var(--accent-color)] text-white hover:opacity-90 transition-all cursor-pointer shadow-lg"
                                        >
                                            {isLoading ? 'Saving Changes...' : 'Save All Changes'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'pomodoro' && (
                                <div className="space-y-6 max-w-3xl">
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-6">
                                        <h3 className="font-bold text-[var(--app-text)] text-sm tracking-wide uppercase text-[var(--app-text-muted)]">Pomodoro Durations</h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-[var(--app-text)]">
                                                    <span>Work / Focus Time</span>
                                                    <span className="text-[var(--accent-color)] font-bold">{timer.workMinutes || 25} mins</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="120"
                                                    value={timer.workMinutes}
                                                    onChange={(e) => handleTimerChange('workMinutes', Number(e.target.value))}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-[var(--app-text)]">
                                                    <span>Short Break</span>
                                                    <span className="text-[var(--accent-color)] font-bold">{timer.shortBreakMinutes || 5} mins</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="60"
                                                    value={timer.shortBreakMinutes}
                                                    onChange={(e) => handleTimerChange('shortBreakMinutes', Number(e.target.value))}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-[var(--app-text)]">
                                                    <span>Long Break</span>
                                                    <span className="text-[var(--accent-color)] font-bold">{timer.longBreakMinutes || 15} mins</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="60"
                                                    value={timer.longBreakMinutes}
                                                    onChange={(e) => handleTimerChange('longBreakMinutes', Number(e.target.value))}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-[var(--app-text)]">
                                                    <span>Sessions Before Long Break</span>
                                                    <span className="text-[var(--accent-color)] font-bold">{timer.sessionsUntilLongBreak || 4} sessions</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="12"
                                                    value={timer.sessionsUntilLongBreak}
                                                    onChange={(e) => handleTimerChange('sessionsUntilLongBreak', Number(e.target.value))}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-[var(--app-border)] space-y-3">
                                            <ToggleSwitch
                                                label="Auto-start Breaks"
                                                description="Automatically start break timer when session completes"
                                                checked={timer.autoStartBreaks}
                                                onChange={(val) => handleTimerChange('autoStartBreaks', val)}
                                            />
                                            <ToggleSwitch
                                                label="Auto-start Work"
                                                description="Automatically start next study session after break"
                                                checked={timer.autoStartWork}
                                                onChange={(val) => handleTimerChange('autoStartWork', val)}
                                            />
                                            <ToggleSwitch
                                                label="Count Break Time in Stats"
                                                description="Include break durations when calculating total study time"
                                                checked={timer.countBreakTime}
                                                onChange={(val) => handleTimerChange('countBreakTime', val)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'countdown' && (
                                <div className="space-y-6 max-w-3xl">
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-6">
                                        <h3 className="font-bold text-[var(--app-text)] text-sm tracking-wide uppercase text-[var(--app-text-muted)]">Countdown Duration</h3>

                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                Default Countdown Minutes
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="180"
                                                value={timer.countdownMinutes}
                                                onChange={(e) => handleTimerChange('countdownMinutes', Number(e.target.value))}
                                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-[var(--app-text)] mb-2 uppercase tracking-wider">Quick Preset Options</p>
                                            <div className="flex flex-wrap gap-2">
                                                {[5, 10, 15, 25, 30, 45, 60].map((m) => (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        onClick={() => handleTimerChange('countdownMinutes', m)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                                            timer.countdownMinutes === m
                                                                ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-sm'
                                                                : 'bg-[var(--app-bg)] text-[var(--app-text)] border-[var(--app-border)] hover:border-[var(--accent-color)]'
                                                        }`}
                                                    >
                                                        {m} mins
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'stopwatch' && (
                                <div className="space-y-6 max-w-3xl">
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-6">
                                        <h3 className="font-bold text-[var(--app-text)] text-sm tracking-wide uppercase text-[var(--app-text-muted)]">Stopwatch Settings</h3>

                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                Target Continuous Study Alert (Hours)
                                            </label>
                                            <select
                                                value={stopwatchTargetHours}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    setStopwatchTargetHours(val);
                                                    void settingsService.patchSettings({ stopwatchTargetHours: val }).catch(() => {});
                                                }}
                                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)] cursor-pointer"
                                            >
                                                <option value={1}>1 Hour Target</option>
                                                <option value={2}>2 Hours Target</option>
                                                <option value={3}>3 Hours Target</option>
                                                <option value={4}>4 Hours Target</option>
                                            </select>
                                        </div>

                                        <ToggleSwitch
                                            label="Enable Lap Split Time Recording"
                                            description="Track study splits during stopwatch mode"
                                            checked={enableLapRecording}
                                            onChange={(val) => setEnableLapRecording(val)}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-6 max-w-3xl">
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-6">
                                        <div>
                                            <p className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-2">Color Mode</p>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                                                <div>
                                                    <p className="text-xs font-bold text-[var(--app-text)]">Active Mode</p>
                                                    <p className="text-[11px] text-[var(--app-text-muted)]">Toggle between Dark and Light palette variants.</p>
                                                </div>
                                                <div className="flex bg-neutral-500/10 p-1 rounded-xl border border-[var(--app-border)] gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setColorMode('dark')}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                            colorMode === 'dark'
                                                                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                                                                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                                                        }`}
                                                    >
                                                        <Moon className="w-3.5 h-3.5" />
                                                        <span>Dark</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setColorMode('light')}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                            colorMode === 'light'
                                                                ? 'bg-[var(--accent-color)] text-white shadow-sm'
                                                                : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                                                        }`}
                                                    >
                                                        <Sun className="w-3.5 h-3.5" />
                                                        <span>Light</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">Theme Presets</p>
                                                <span className="text-[11px] text-[var(--accent-color)] font-semibold uppercase">{ALL_THEME_KEYS.length} Presets Available</span>
                                            </div>
                                            <p className="text-[11px] text-[var(--app-text-muted)] mb-3">Each theme features custom tinted backgrounds and accents for both light and dark modes.</p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {ALL_THEME_KEYS.map((k) => {
                                                    const t = THEME_PRESETS[k];
                                                    const isSelected = colorTheme === k;
                                                    const activeVariant = colorMode === 'dark' ? t.dark : t.light;
                                                    return (
                                                        <button
                                                            key={k}
                                                            type="button"
                                                            onClick={() => setColorTheme(k)}
                                                            className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 bg-[var(--app-bg)] cursor-pointer group hover:border-[var(--accent-color)]/50 ${
                                                                isSelected
                                                                    ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/30 shadow-md'
                                                                    : 'border-[var(--app-border)]'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between w-full">
                                                                <span className="text-xs font-bold text-[var(--app-text)] group-hover:text-[var(--accent-color)] transition-colors">{t.name}</span>
                                                                {isSelected && <Check className="w-4 h-4 text-[var(--accent-color)] shrink-0" />}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="h-6 flex-1 rounded-lg border border-black/10 flex items-center justify-center text-[9px] font-bold shadow-inner"
                                                                    style={{ backgroundColor: t.light.bg, color: t.light.text }}
                                                                    title="Light variant background"
                                                                >
                                                                    Light
                                                                </div>
                                                                <div
                                                                    className="h-6 flex-1 rounded-lg border border-white/10 flex items-center justify-center text-[9px] font-bold shadow-inner"
                                                                    style={{ backgroundColor: t.dark.bg, color: t.dark.text }}
                                                                    title="Dark variant background"
                                                                >
                                                                    Dark
                                                                </div>
                                                                <div
                                                                    className="w-6 h-6 rounded-lg shrink-0 shadow-sm border border-white/10"
                                                                    style={{ backgroundColor: activeVariant.accent }}
                                                                    title="Accent color"
                                                                />
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider mb-2">Background Videos</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {bg.options.map((option) => (
                                                    <button
                                                        key={option.source}
                                                        type="button"
                                                        onClick={() => bg.setBackground(option.source)}
                                                        className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                            bg.source === option.source
                                                                ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-[var(--accent-color)] shadow-sm'
                                                                : 'bg-[var(--app-bg)] border-[var(--app-border)] text-[var(--app-text)] hover:border-neutral-500/30'
                                                        }`}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-4">
                                        <h3 className="font-bold text-[var(--app-text)] text-sm uppercase tracking-wider text-[var(--app-text-muted)]">Change Password</h3>

                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs hover:opacity-90 transition-all shadow-md"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'calendar' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-4">
                                        <h3 className="font-bold text-[var(--app-text)] text-sm uppercase tracking-wider text-[var(--app-text-muted)]">Calendar Preferences</h3>

                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                Week Starts On
                                            </label>
                                            <select
                                                value={weekStartsOn}
                                                onChange={(e) => setWeekStartsOn(Number(e.target.value))}
                                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                            >
                                                <option value={1}>Monday</option>
                                                <option value={0}>Sunday</option>
                                            </select>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAcademicSave}
                                            className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs hover:opacity-90 transition-all shadow-md"
                                        >
                                            Save Calendar Preferences
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'grades' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-4">
                                        <h3 className="font-bold text-[var(--app-text)] text-sm uppercase tracking-wider text-[var(--app-text-muted)]">Grade Scales</h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                    Grade Scale Maximum
                                                </label>
                                                <input
                                                    type="text"
                                                    value={gradeScaleMax}
                                                    onChange={(e) => setGradeScaleMax(e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-[var(--app-text)] mb-1.5 uppercase tracking-wider">
                                                    Passing Grade Score
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passGrade}
                                                    onChange={(e) => setPassGrade(e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-sm text-[var(--app-text)] focus:outline-none focus:border-[var(--accent-color)]"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAcademicSave}
                                            className="px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-bold text-xs hover:opacity-90 transition-all shadow-md"
                                        >
                                            Save Grade Scales
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'sound' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-6">
                                        <h3 className="font-bold text-[var(--app-text)] text-sm uppercase tracking-wider text-[var(--app-text-muted)]">Audio Volumes</h3>

                                        <div className="space-y-4">
                                            {(['master', 'alarm', 'notification', 'background'] as SoundCategory[]).map((cat) => (
                                                <div key={cat} className="space-y-1.5 p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                                                    <div className="flex justify-between text-xs font-semibold text-[var(--app-text)]">
                                                        <span className="capitalize">{cat} Volume</span>
                                                        <span className="text-[var(--accent-color)] font-bold">{sound.volumes[cat]}%</span>
                                                    </div>
                                                    <div className="py-2 px-1 overflow-visible flex items-center">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={sound.volumes[cat]}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value);
                                                                sound.setVolume(cat, val);
                                                                const payload: Record<string, number> = {};
                                                                if (cat === 'master') payload.masterVolume = val;
                                                                if (cat === 'alarm') payload.alarmVolume = val;
                                                                if (cat === 'notification') payload.notificationVolume = val;
                                                                if (cat === 'background') payload.backgroundVolume = val;
                                                                void settingsService.patchSettings(payload).catch(() => {});
                                                            }}
                                                            className="w-full cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-[var(--app-border)] flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => sound.playAlarm()}
                                                className="px-4 py-2 rounded-xl bg-neutral-500/10 text-[var(--app-text)] text-xs font-semibold hover:bg-neutral-500/20 transition-all border border-[var(--app-border)] flex items-center gap-2 cursor-pointer"
                                            >
                                                <Play className="w-3.5 h-3.5 text-[var(--accent-color)]" /> Test Alarm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'developer' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="bg-neutral-500/5 rounded-2xl p-6 border border-[var(--app-border)] space-y-4">
                                        <h3 className="font-bold text-[var(--app-text)] text-sm uppercase tracking-wider text-[var(--app-text-muted)]">Developer Diagnostic</h3>

                                        <div className="bg-[var(--app-bg)] text-emerald-400 p-4 rounded-xl font-mono text-xs space-y-1 border border-[var(--app-border)]">
                                            <p>App Version: StudyZen v1.0.0</p>
                                            <p>Environment: {import.meta.env.MODE || 'development'}</p>
                                            <p>Backend API: http://localhost:8080/api</p>
                                            <p>Active Theme: {colorTheme} ({colorMode})</p>
                                            <p>Logged User: {user?.email}</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                localStorage.removeItem('studyzen_timer_config');
                                                localStorage.removeItem('studyzen_theme');
                                                localStorage.removeItem('studyzen_sound');
                                                localStorage.removeItem('studyzen_background');
                                                window.location.reload();
                                            }}
                                            className="px-4 py-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold hover:bg-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" /> Clear Local Cache
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </main>
                </div>
            </div>

            {isAvatarModalOpen && (
                <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--app-text)]">Choose Avatar Preset</h3>
                                <p className="text-xs text-[var(--app-text-muted)] mt-0.5">Select an avatar from the StudyZen library</p>
                            </div>
                            <button
                                onClick={() => setIsAvatarModalOpen(false)}
                                className="p-2 rounded-xl bg-neutral-500/10 text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-80 overflow-y-auto p-1">
                            {AVATAR_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => handleSelectAvatarPreset(preset)}
                                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                                        avatarTitle === preset.name
                                            ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/30'
                                            : 'bg-[var(--app-bg)] border-[var(--app-border)] hover:border-neutral-500/40'
                                    }`}
                                >
                                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-neutral-500/10 border border-[var(--app-border)]">
                                        <img src={preset.url} alt={preset.name} className="h-full w-full object-cover" />
                                    </div>
                                    <span className="text-[10px] font-bold text-[var(--app-text)] text-center truncate w-full">
                                        {preset.name.replace(' Avatar', '')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;