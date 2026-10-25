import { api } from './api';

export const studyDataService = {
    deleteAll: async (): Promise<void> => {
        await api.delete('/study-data');
    },
};
