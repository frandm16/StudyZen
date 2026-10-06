export interface UserSettings {
    userId?: string;
    weekStartsOn: number;
    defaultSessionMinutes: number;
    theme: string;
    gradeScaleMax: number;
    passGrade: number;
    pomodoroWorkMinutes: number;
    pomodoroShortBreakMinutes: number;
    pomodoroLongBreakMinutes: number;
    pomodoroSessionsInterval: number;
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    countBreakTime: boolean;
    countdownDefaultMinutes: number;
    stopwatchTargetHours: number;
    colorMode: 'dark' | 'light';
    colorTheme: 'default' | 'glacier' | 'dusk' | 'fern' | 'blaze' | 'solar' | 'sakura' | 'mocha';
    masterVolume: number;
    alarmVolume: number;
    notificationVolume: number;
    backgroundVolume: number;
    alarmPreset: string;
    updatedAt?: string;
}

export type UpdateUserSettingsDTO = Partial<Omit<UserSettings, 'userId' | 'updatedAt'>>;
