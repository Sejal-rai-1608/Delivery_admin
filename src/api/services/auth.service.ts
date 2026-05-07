import apiClient, { USE_MOCK } from '../client';
import { ENDPOINTS } from '../endpoints';
import { User } from '../../types';

export const authService = {
  login: async (email: string, password: string):Promise<{token: string, user: User}> => {
    if (USE_MOCK) {
       // simulated login
       return new Promise(resolve => {
         setTimeout(() => {
           resolve({
             token: 'mock-jwt-token-123',
             user: { id: 'u-1', email, name: 'Admin User', role: 'ADMIN' }
           });
         }, 800);
       });
    }
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
    return response.data;
  }
};
