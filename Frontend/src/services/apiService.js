import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add interceptor to add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const apiService = {
    // Auth
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),

    // Opportunities
    createOpportunity: (data) => api.post('/opportunities', data),
    getOpportunities: () => api.get('/opportunities'),
    getOpportunityById: (id) => api.get(`/opportunities/${id}`),
    updateOpportunity: (id, data) => api.put(`/opportunities/${id}`, data),
    deleteOpportunity: (id) => api.delete(`/opportunities/${id}`),

    // Applications
    applyForOpportunity: (id) => api.post(`/opportunities/${id}/apply`),
    updateApplicationStatus: (id, data) => api.put(`/opportunities/${id}/status`, data),

    // User Profile
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),

    // Messages
    sendMessage: (data) => api.post('/messages', data),

    // Match
    getMatchedOpportunities: (userId) => api.get(`/match/${userId}`),
    findMatches: (opportunityId) => api.post(`/opportunities/${opportunityId}/match`),

    // Connections (Network)
    getConnections: () => api.get('/connections'),
    getConnectionStatus: () => api.get('/connections/status'),
    sendConnectionRequest: (toId) => api.post('/connections/request', { toId }),
    acceptConnectionRequest: (connectionId) => api.post('/connections/accept', { connectionId }),
    rejectConnectionRequest: (connectionId) => api.post('/connections/reject', { connectionId }),

    // Reports
    getReports: () => api.get('/admin/reports'),
};

export default apiService;
