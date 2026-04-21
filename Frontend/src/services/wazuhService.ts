export type { WazuhLog } from '../types';
import { api } from './api';

export const wazuhService = {
    getLogs: async (limit: number = 20) => {
        return api.getWazuhIndexerAlerts(limit);
    },

    getAgents: async () => {
        return api.getWazuhAgents();
    },

    isConnected: async () => {
        await api.getWazuhIndexerAlerts(1);
        return true;
    }
};
