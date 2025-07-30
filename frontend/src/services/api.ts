import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // 启用跨域cookie
});

// 请求拦截器 - 简化逻辑，Session-based认证
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.url);
    return config;
  },
  (error) => {
    console.log('API Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理401错误
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.config.url);
    return response;
  },
  (error) => {
    console.log('API Response Error:', error.response?.status, error.response?.data, 'URL:', error.config?.url);
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// 用户管理API
export const userAPI = {
  getUsers: () => api.get('/users/'),
  getUser: (id: number) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post('/users/', data),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

// 角色管理API
export const roleAPI = {
  getRoles: () => api.get('/roles/'),
  getRole: (id: number) => api.get(`/roles/${id}`),
  createRole: (data: any) => api.post('/roles/', data),
  updateRole: (id: number, data: any) => api.put(`/roles/${id}`, data),
  deleteRole: (id: number) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get('/roles/permissions'),
};

// 项目管理API
export const projectAPI = {
  getProjects: () => api.get('/projects/'),
  getProject: (id: number) => api.get(`/projects/${id}`),
  createProject: (data: any) => api.post('/projects/', data),
  updateProject: (id: number, data: any) => api.put(`/projects/${id}`, data),
  deleteProject: (id: number) => api.delete(`/projects/${id}`),
  getProjectMembers: (id: number) => api.get(`/projects/${id}/members`),
  addProjectMember: (projectId: number, data: any) => 
    api.post(`/projects/${projectId}/members`, data),
  removeProjectMember: (projectId: number, userId: number) => 
    api.delete(`/projects/${projectId}/members/${userId}`),
  updateProjectStatus: (id: number, status: string) => 
    api.put(`/projects/${id}/status`, { status }),
  getUsers: () => api.get('/users/'), // 用于选择项目经理和成员
};

// 工时记录API
export const timeRecordAPI = {
  getTimeRecords: () => api.get('/time-records/'),
  getTimeRecord: (id: number) => api.get(`/time-records/${id}`),
  createTimeRecord: (data: any) => api.post('/time-records/', data),
  updateTimeRecord: (id: number, data: any) => api.put(`/time-records/${id}`, data),
  deleteTimeRecord: (id: number) => api.delete(`/time-records/${id}`),
  approveTimeRecord: (id: number) => api.post(`/time-records/${id}/approve`),
  getWorkTypes: () => api.get('/time-records/work-types'),
  getStatistics: () => api.get('/time-records/statistics'),
};

// 日报周报API
export const reportAPI = {
  // 日报
  getDailyReports: () => api.get('/reports/daily'),
  getDailyReport: (id: number) => api.get(`/reports/daily/${id}`),
  createDailyReport: (data: any) => api.post('/reports/daily', data),
  updateDailyReport: (id: number, data: any) => api.put(`/reports/daily/${id}`, data),
  deleteDailyReport: (id: number) => api.delete(`/reports/daily/${id}`),
  approveDailyReport: (id: number) => api.post(`/reports/daily/${id}/approve`),
  
  // 周报
  getWeeklyReports: () => api.get('/reports/weekly'),
  getWeeklyReport: (id: number) => api.get(`/reports/weekly/${id}`),
  createWeeklyReport: (data: any) => api.post('/reports/weekly', data),
  updateWeeklyReport: (id: number, data: any) => api.put(`/reports/weekly/${id}`, data),
  deleteWeeklyReport: (id: number) => api.delete(`/reports/weekly/${id}`),
  approveWeeklyReport: (id: number) => api.post(`/reports/weekly/${id}/approve`),
  
  // 统计
  getStatistics: () => api.get('/reports/statistics'),
};

// 成本统计API
export const costAPI = {
  // 个人成本计算
  calculatePersonalCost: (data: any) => api.post('/costs/calculate', data),
  getPersonalCalculations: () => api.get('/costs/calculations'),
  updatePersonalCalculation: (id: number, data: any) => api.put(`/costs/calculations/${id}`, data),
  deletePersonalCalculation: (id: number) => api.delete(`/costs/calculations/${id}`),
  
  // 项目成本
  calculateProjectCost: (projectId: number, data: any) => api.post(`/costs/project/${projectId}`, data),
  getProjectCosts: (projectId: number) => api.get(`/costs/project/${projectId}`),
  
  // 成本报表
  getCostReports: () => api.get('/costs/reports'),
  createCostReport: (data: any) => api.post('/costs/reports', data),
  getCostReport: (id: number) => api.get(`/costs/reports/${id}`),
  
  // 统计
  getStatistics: () => api.get('/costs/statistics'),
};

export default api; 