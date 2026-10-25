import type { LucideIcon } from 'lucide-react';

export type ScreenshotId = 'timer' | 'subjects' | 'planning' | 'daily' | 'weekly' | 'stats';

export interface ScreenshotItem {
    id: ScreenshotId;
    label: string;
    headline: string;
    caption: string;
    lightSrc: string;
    darkSrc: string;
    alt: string;
    icon: LucideIcon;
}

export interface FeatureItem {
    title: string;
    description: string;
    icon: LucideIcon;
}
