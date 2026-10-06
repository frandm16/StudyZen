import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { settingsService } from '../services/settings-service';

export type ColorMode = 'dark' | 'light';
export type ColorTheme = 'default' | 'glacier' | 'dusk' | 'fern' | 'blaze' | 'solar' | 'sakura' | 'mocha';

export interface ThemeColors {
    bg: string;
    card: string;
    cardHover: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
    accentHover: string;
    accentRing: string;
    previewDark: string;
    previewLight: string;
}

export interface ThemePreset {
    id: ColorTheme;
    name: string;
    light: ThemeColors;
    dark: ThemeColors;
}

export const THEME_PRESETS: Record<ColorTheme, ThemePreset> = {
    default: {
        id: 'default',
        name: 'Default',
        light: {
            bg: '#eef2f6',
            card: '#ffffff',
            cardHover: '#f8fafc',
            text: '#0f172a',
            textMuted: '#64748b',
            border: 'rgba(15, 23, 42, 0.09)',
            accent: '#2563eb',
            accentHover: '#1d4ed8',
            accentRing: 'rgba(37, 99, 235, 0.35)',
            previewDark: '#0b0f17',
            previewLight: '#eef2f6',
        },
        dark: {
            bg: '#0b0f17',
            card: '#111827',
            cardHover: '#182238',
            text: '#f8fafc',
            textMuted: '#94a3b8',
            border: 'rgba(255, 255, 255, 0.08)',
            accent: '#38bdf8',
            accentHover: '#0ea5e9',
            accentRing: 'rgba(56, 189, 248, 0.35)',
            previewDark: '#0b0f17',
            previewLight: '#eef2f6',
        },
    },
    glacier: {
        id: 'glacier',
        name: 'Glacier',
        light: {
            bg: '#dbeafe',
            card: '#eff6ff',
            cardHover: '#ffffff',
            text: '#082f49',
            textMuted: '#0369a1',
            border: 'rgba(8, 47, 73, 0.12)',
            accent: '#0284c7',
            accentHover: '#0369a1',
            accentRing: 'rgba(2, 132, 199, 0.35)',
            previewDark: '#041525',
            previewLight: '#dbeafe',
        },
        dark: {
            bg: '#041525',
            card: '#0a2238',
            cardHover: '#0f2e4c',
            text: '#e0f2fe',
            textMuted: '#7dd3fc',
            border: 'rgba(56, 189, 248, 0.16)',
            accent: '#38bdf8',
            accentHover: '#7dd3fc',
            accentRing: 'rgba(56, 189, 248, 0.35)',
            previewDark: '#041525',
            previewLight: '#dbeafe',
        },
    },
    dusk: {
        id: 'dusk',
        name: 'Dusk',
        light: {
            bg: '#f3e8ff',
            card: '#faf5ff',
            cardHover: '#ffffff',
            text: '#2e1065',
            textMuted: '#7e22ce',
            border: 'rgba(46, 16, 101, 0.12)',
            accent: '#9333ea',
            accentHover: '#7e22ce',
            accentRing: 'rgba(147, 51, 234, 0.35)',
            previewDark: '#120726',
            previewLight: '#f3e8ff',
        },
        dark: {
            bg: '#120726',
            card: '#1d0e3b',
            cardHover: '#291552',
            text: '#f3e8ff',
            textMuted: '#c084fc',
            border: 'rgba(168, 85, 247, 0.18)',
            accent: '#c084fc',
            accentHover: '#a855f7',
            accentRing: 'rgba(192, 132, 252, 0.35)',
            previewDark: '#120726',
            previewLight: '#f3e8ff',
        },
    },
    fern: {
        id: 'fern',
        name: 'Fern',
        light: {
            bg: '#dcfce7',
            card: '#f0fdf4',
            cardHover: '#ffffff',
            text: '#052e16',
            textMuted: '#15803d',
            border: 'rgba(5, 46, 22, 0.12)',
            accent: '#16a34a',
            accentHover: '#15803d',
            accentRing: 'rgba(22, 163, 74, 0.35)',
            previewDark: '#041c10',
            previewLight: '#dcfce7',
        },
        dark: {
            bg: '#041c10',
            card: '#092e1b',
            cardHover: '#0f3f26',
            text: '#dcfce7',
            textMuted: '#86efac',
            border: 'rgba(34, 197, 94, 0.18)',
            accent: '#4ade80',
            accentHover: '#22c55e',
            accentRing: 'rgba(74, 222, 128, 0.35)',
            previewDark: '#041c10',
            previewLight: '#dcfce7',
        },
    },
    blaze: {
        id: 'blaze',
        name: 'Blaze',
        light: {
            bg: '#ffe4e6',
            card: '#fff1f2',
            cardHover: '#ffffff',
            text: '#4c0519',
            textMuted: '#be123c',
            border: 'rgba(76, 5, 25, 0.12)',
            accent: '#e11d48',
            accentHover: '#be123c',
            accentRing: 'rgba(225, 29, 72, 0.35)',
            previewDark: '#1f0408',
            previewLight: '#ffe4e6',
        },
        dark: {
            bg: '#1f0408',
            card: '#330a12',
            cardHover: '#47101b',
            text: '#ffe4e6',
            textMuted: '#fda4af',
            border: 'rgba(244, 63, 94, 0.18)',
            accent: '#fb7185',
            accentHover: '#f43f5e',
            accentRing: 'rgba(251, 113, 133, 0.35)',
            previewDark: '#1f0408',
            previewLight: '#ffe4e6',
        },
    },
    solar: {
        id: 'solar',
        name: 'Solar',
        light: {
            bg: '#fef3c7',
            card: '#fffbeb',
            cardHover: '#ffffff',
            text: '#451a03',
            textMuted: '#b45309',
            border: 'rgba(69, 26, 3, 0.12)',
            accent: '#d97706',
            accentHover: '#b45309',
            accentRing: 'rgba(217, 119, 6, 0.35)',
            previewDark: '#1c0d02',
            previewLight: '#fef3c7',
        },
        dark: {
            bg: '#1c0d02',
            card: '#2e1805',
            cardHover: '#422309',
            text: '#fef3c7',
            textMuted: '#fcd34d',
            border: 'rgba(245, 158, 11, 0.18)',
            accent: '#fbbf24',
            accentHover: '#f59e0b',
            accentRing: 'rgba(251, 191, 36, 0.35)',
            previewDark: '#1c0d02',
            previewLight: '#fef3c7',
        },
    },
    sakura: {
        id: 'sakura',
        name: 'Sakura',
        light: {
            bg: '#fce7f3',
            card: '#fdf2f8',
            cardHover: '#ffffff',
            text: '#500724',
            textMuted: '#be185d',
            border: 'rgba(80, 7, 36, 0.12)',
            accent: '#db2777',
            accentHover: '#be185d',
            accentRing: 'rgba(219, 39, 119, 0.35)',
            previewDark: '#1f0516',
            previewLight: '#fce7f3',
        },
        dark: {
            bg: '#1f0516',
            card: '#330c26',
            cardHover: '#471236',
            text: '#fce7f3',
            textMuted: '#f472b6',
            border: 'rgba(236, 72, 153, 0.18)',
            accent: '#f472b6',
            accentHover: '#ec4899',
            accentRing: 'rgba(244, 114, 182, 0.35)',
            previewDark: '#1f0516',
            previewLight: '#fce7f3',
        },
    },
    mocha: {
        id: 'mocha',
        name: 'Mocha',
        light: {
            bg: '#eddcd2',
            card: '#f7ede2',
            cardHover: '#ffffff',
            text: '#29180c',
            textMuted: '#784924',
            border: 'rgba(41, 24, 12, 0.12)',
            accent: '#9a5b28',
            accentHover: '#784924',
            accentRing: 'rgba(154, 91, 40, 0.35)',
            previewDark: '#170d07',
            previewLight: '#eddcd2',
        },
        dark: {
            bg: '#170d07',
            card: '#271810',
            cardHover: '#382319',
            text: '#faedd9',
            textMuted: '#d4a373',
            border: 'rgba(212, 163, 115, 0.18)',
            accent: '#d4a373',
            accentHover: '#c48b55',
            accentRing: 'rgba(212, 163, 115, 0.35)',
            previewDark: '#170d07',
            previewLight: '#eddcd2',
        },
    },
};

export interface ThemeConfig {
    colorMode: ColorMode;
    colorTheme: ColorTheme;
}

interface ThemeContextType {
    colorMode: ColorMode;
    colorTheme: ColorTheme;
    setColorMode: (mode: ColorMode) => void;
    setColorTheme: (theme: ColorTheme) => void;
    toggleColorMode: () => void;
    preset: ThemePreset;
    currentColors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'studyzen_theme';

function loadPersistedTheme(): ThemeConfig {
    try {
        const raw = localStorage.getItem(THEME_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.colorMode && parsed.colorTheme && parsed.colorTheme in THEME_PRESETS) {
                return parsed;
            }
        }
    } catch {
    }
    return { colorMode: 'dark', colorTheme: 'default' };
}

function applyThemeDom(config: ThemeConfig) {
    const root = document.documentElement;
    const preset = THEME_PRESETS[config.colorTheme] || THEME_PRESETS.default;
    const colors = config.colorMode === 'dark' ? preset.dark : preset.light;

    if (config.colorMode === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }

    root.style.setProperty('--app-bg', colors.bg);
    root.style.setProperty('--app-card-bg', colors.card);
    root.style.setProperty('--app-card-hover', colors.cardHover);
    root.style.setProperty('--app-text', colors.text);
    root.style.setProperty('--app-text-muted', colors.textMuted);
    root.style.setProperty('--app-border', colors.border);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--accent-hover', colors.accentHover);
    root.style.setProperty('--accent-ring', colors.accentRing);
    root.style.setProperty('--app-slider-track', config.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)');
    root.setAttribute('data-theme', config.colorTheme);
    root.setAttribute('data-mode', config.colorMode);
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeConfig>(loadPersistedTheme);

    useEffect(() => {
        applyThemeDom(theme);
        try {
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
        } catch {
        }
    }, [theme]);

    const setColorMode = (colorMode: ColorMode) => {
        setTheme((prev) => {
            const next: ThemeConfig = { ...prev, colorMode };
            void settingsService.patchSettings({ colorMode, theme: colorMode }).catch(() => {});
            return next;
        });
    };

    const setColorTheme = (colorTheme: ColorTheme) => {
        setTheme((prev) => {
            const next: ThemeConfig = { ...prev, colorTheme };
            void settingsService.patchSettings({ colorTheme }).catch(() => {});
            return next;
        });
    };

    const toggleColorMode = () => {
        setColorMode(theme.colorMode === 'dark' ? 'light' : 'dark');
    };

    const preset = THEME_PRESETS[theme.colorTheme] || THEME_PRESETS.default;
    const currentColors = theme.colorMode === 'dark' ? preset.dark : preset.light;

    return (
        <ThemeContext.Provider
            value={{
                colorMode: theme.colorMode,
                colorTheme: theme.colorTheme,
                setColorMode,
                setColorTheme,
                toggleColorMode,
                preset,
                currentColors,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
