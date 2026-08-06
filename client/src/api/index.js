// client/src/api/index.js - Axios instance and API calls
import axios from 'axios';

// In Tauri production mode the frontend loads from file:// protocol,
// so we must use the full HTTP URL to reach our Express backend.
// In dev mode Vite proxies /api to http://127.0.0.1:17321 automatically.
const isTauri = typeof window !== 'undefined' && !!window.__TAURI__;
const apiBase = isTauri ? 'http://127.0.0.1:17321/api' : '/api';

const api = axios.create({
  baseURL: apiBase,
  timeout: 10000,
});

// Daily Plan APIs
export const getTodayPlan = (date) => api.get('/daily-plan/today', { params: { date } });
export const getPlanByDate = (date) => api.get(`/daily-plan/${date}`);
export const getAllPlans = () => api.get('/daily-plan/all');
export const updatePlanItems = (date, plan_items) => api.put('/daily-plan', { date, plan_items });

// Task Pool APIs
export const getAllTasks = () => api.get('/tasks');
export const createTaskApi = (task) => api.post('/tasks', task);
export const updateTaskApi = (id, task) => api.put(`/tasks/${id}`, task);
export const deleteTaskApi = (id) => api.delete(`/tasks/${id}`);

// Template APIs
export const getAllTemplates = () => api.get('/templates');
export const createTemplateApi = (template) => api.post('/templates', template);
export const updateTemplateApi = (id, template) => api.put(`/templates/${id}`, template);
export const setDefaultTemplateApi = (id) => api.put(`/templates/${id}/set-default`);
export const deleteTemplateApi = (id) => api.delete(`/templates/${id}`);

export default api;
