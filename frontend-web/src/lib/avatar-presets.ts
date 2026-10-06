export interface AvatarPreset {
    id: string;
    name: string;
    url: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
    {
        id: 'dolphin',
        name: 'Dolphin Avatar',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230284c7"/><path d="M25 60 C35 40 60 30 80 45 C70 65 45 75 25 60 Z" fill="%23e0f2fe"/><path d="M65 42 Q68 38 72 40 Q70 45 65 42" fill="%230284c7"/><circle cx="68" cy="44" r="3" fill="%230f172a"/><path d="M50 32 L58 20 L62 30 Z" fill="%230369a1"/></svg>',
    },
    {
        id: 'fox',
        name: 'Fox Avatar',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ea580c"/><polygon points="25,25 35,50 15,45" fill="%23c2410c"/><polygon points="75,25 65,50 85,45" fill="%23c2410c"/><polygon points="28,28 34,46 20,43" fill="%23ffedd5"/><polygon points="72,28 66,46 80,43" fill="%23ffedd5"/><path d="M25 50 Q50 90 75 50 Q50 65 25 50 Z" fill="%23ffedd5"/><circle cx="40" cy="50" r="4" fill="%231c1917"/><circle cx="60" cy="50" r="4" fill="%231c1917"/><ellipse cx="50" cy="62" rx="6" ry="4" fill="%231c1917"/></svg>',
    },
    {
        id: 'owl',
        name: 'Owl Avatar',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%234338ca"/><circle cx="38" cy="45" r="16" fill="%23e0e7ff"/><circle cx="62" cy="45" r="16" fill="%23e0e7ff"/><circle cx="38" cy="45" r="7" fill="%231e1b4b"/><circle cx="62" cy="45" r="7" fill="%231e1b4b"/><polygon points="50,52 44,62 56,62" fill="%23f59e0b"/><polygon points="30,20 40,32 24,34" fill="%233730a3"/><polygon points="70,20 60,32 76,34" fill="%233730a3"/></svg>',
    },
    {
        id: 'bear',
        name: 'Bear Avatar',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%2378350f"/><circle cx="25" cy="28" r="14" fill="%2378350f"/><circle cx="25" cy="28" r="8" fill="%23fef3c7"/><circle cx="75" cy="28" r="14" fill="%2378350f"/><circle cx="75" cy="28" r="8" fill="%23fef3c7"/><ellipse cx="50" cy="62" rx="18" ry="14" fill="%23fef3c7"/><circle cx="38" cy="46" r="4" fill="%231c1917"/><circle cx="62" cy="46" r="4" fill="%231c1917"/><ellipse cx="50" cy="58" rx="7" ry="5" fill="%231c1917"/></svg>',
    },
    {
        id: 'panda',
        name: 'Panda Avatar',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23f8fafc"/><circle cx="22" cy="25" r="14" fill="%230f172a"/><circle cx="78" cy="25" r="14" fill="%230f172a"/><ellipse cx="36" cy="48" rx="10" ry="14" fill="%230f172a"/><ellipse cx="64" cy="48" rx="10" ry="14" fill="%230f172a"/><circle cx="36" cy="46" r="4" fill="%23ffffff"/><circle cx="64" cy="46" r="4" fill="%23ffffff"/><ellipse cx="50" cy="65" rx="8" ry="5" fill="%230f172a"/></svg>',
    },
    {
        id: 'cat',
        name: 'Cat Avatar',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%230d9488"/><polygon points="20,20 40,40 18,50" fill="%23115e59"/><polygon points="80,20 60,40 82,50" fill="%23115e59"/><ellipse cx="50" cy="60" rx="22" ry="16" fill="%23ccfbf1"/><ellipse cx="36" cy="46" rx="5" ry="8" fill="%23134e4a"/><ellipse cx="64" cy="46" rx="5" ry="8" fill="%23134e4a"/><polygon points="50,56 46,62 54,62" fill="%23f43f5e"/></svg>',
    },
    {
        id: 'rocket',
        name: 'Rocket Avatar',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%231e1b4b"/><path d="M50 18 C30 40 30 70 30 78 L70 78 C70 70 70 40 50 18 Z" fill="%23e0e7ff"/><polygon points="30,65 15,80 30,80" fill="%23ef4444"/><polygon points="70,65 85,80 70,80" fill="%23ef4444"/><circle cx="50" cy="48" r="10" fill="%2338bdf8"/><circle cx="50" cy="48" r="7" fill="%230284c7"/></svg>',
    },
    {
        id: 'brain',
        name: 'Brain Avatar',
        url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23831843"/><path d="M30 40 Q20 25 40 25 Q50 15 60 25 Q80 25 70 40 Q85 55 70 70 Q50 85 30 70 Q15 55 30 40 Z" fill="%23fbcfe8"/><path d="M50 25 V75 M35 35 Q50 45 65 35 M32 55 Q50 65 68 55" stroke="%23be185d" stroke-width="4" fill="none"/></svg>',
    },
];

export function getRandomAvatarPreset(): AvatarPreset {
    const randomIndex = Math.floor(Math.random() * AVATAR_PRESETS.length);
    return AVATAR_PRESETS[randomIndex];
}
