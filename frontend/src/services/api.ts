import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器 - 添加token
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

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // token过期，跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  profile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
};

// 用户管理API
export const userAPI = {
  getUsers: (params?: any) => api.get('/users', { params }),
  getUser: (id: number) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post('/users', data),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
  getDepartments: () => api.get('/users/departments'),
};

// 角色管理API
export const roleAPI = {
  getRoles: (params?: any) => api.get('/roles', { params }),
  getRole: (id: number) => api.get(`/roles/${id}`),
  createRole: (data: any) => api.post('/roles', data),
  updateRole: (id: number, data: any) => api.put(`/roles/${id}`, data),
  deleteRole: (id: number) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get('/roles/permissions'),
};

// 项目管理API
export const projectAPI = {
  getProjects: (params?: any) => api.get('/projects', { params }),
  getProject: (id: number) => api.get(`/projects/${id}`),
  createProject: (data: any) => api.post('/projects', data),
  updateProject: (id: number, data: any) => api.put(`/projects/${id}`, data),
  deleteProject: (id: number) => api.delete(`/projects/${id}`),
  getProjectMembers: (id: number) => api.get(`/projects/${id}/members`),
  addProjectMember: (id: number, data: any) => api.post(`/projects/${id}/members`, data),
  removeProjectMember: (id: number, userId: number) => api.delete(`/projects/${id}/members/${userId}`),
  updateProjectStatus: (id: number, data: any) => api.put(`/projects/${id}/status`, data),
  getProjectStatuses: () => api.get('/projects/status'),
};

// 时间记录API
export const timeRecordAPI = {
  getTimeRecords: (params?: any) => api.get('/time-records', { params }),
  getTimeRecord: (id: number) => api.get(`/time-records/${id}`),
  createTimeRecord: (data: any) => api.post('/time-records', data),
  updateTimeRecord: (id: number, data: any) => api.put(`/time-records/${id}`, data),
  deleteTimeRecord: (id: number) => api.delete(`/time-records/${id}`),
  approveTimeRecord: (id: number, data: any) => api.post(`/time-records/${id}/approve`, data),
  getTimeStatistics: (params?: any) => api.get('/time-records/statistics', { params }),
  getWorkTypes: () => api.get('/time-records/work-types'),
  createWorkType: (data: any) => api.post('/time-records/work-types', data),
};

// 日报周报API
export const reportAPI = {
  // 日报
  getDailyReports: (params?: any) => api.get('/reports/daily', { params }),
  getDailyReport: (id: number) => api.get(`/reports/daily/${id}`),
  createDailyReport: (data: any) => api.post('/reports/daily', data),
  updateDailyReport: (id: number, data: any) => api.put(`/reports/daily/${id}`, data),
  approveDailyReport: (id: number, data: any) => api.post(`/reports/daily/${id}/approve`, data),
  
  // 周报
  getWeeklyReports: (params?: any) => api.get('/reports/weekly', { params }),
  getWeeklyReport: (id: number) => api.get(`/reports/weekly/${id}`),
  createWeeklyReport: (data: any) => api.post('/reports/weekly', data),
  updateWeeklyReport: (id: number, data: any) => api.put(`/reports/weekly/${id}`, data),
  approveWeeklyReport: (id: number, data: any) => api.post(`/reports/weekly/${id}/approve`, data),
  
  // 统计
  getReportStatistics: (params?: any) => api.get('/reports/statistics', { params }),
};

// 成本计算API
export const costAPI = {
  // 成本计算
  calculateCost: (data: any) => api.post('/costs/calculate', data),
  getCostCalculations: (params?: any) => api.get('/costs/calculations', { params }),
  
  // 项目成本
  calculateProjectCost: (id: number, data: any) => api.post(`/costs/project/${id}`, data),
  getProjectCosts: (id: number, params?: any) => api.get(`/costs/project/${id}`, { params }),
  
  // 成本报表
  getCostReports: (params?: any) => api.get('/costs/reports', { params }),
  getCostReport: (id: number) => api.get(`/costs/reports/${id}`),
  generateCostReport: (data: any) => api.post('/costs/reports', data),
  
  // 统计
  getCostStatistics: (params?: any) => api.get('/costs/statistics', { params }),
};

export default api; 