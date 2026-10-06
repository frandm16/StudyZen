import { api } from './api';
import type { UserSettings, UpdateUserSettingsDTO } from '../types/settings';

export const settingsService = {
    getSettings: async (): Promise<UserSettings> => {
        const response = await api.get<UserSettings>('/settings');
        return response.data;
    },

    updateSettings: async (settings: UpdateUserSettingsDTO): Promise<UserSettings> => {
        const response = await api.put<UserSettings>('/settings', settings);
        return response.data;
    },

    patchSettings: async (settings: UpdateUserSettingsDTO): Promise<UserSettings> => {
        const response = await api.patch<UserSettings>('/settings', settings);
        return response.data;
    },
};
