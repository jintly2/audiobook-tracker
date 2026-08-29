import axios from 'axios';
import { getAccessToken } from '@/lib/supabase';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

// 请求拦截器：附加 JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || '请求失败';
    console.error(`[API Error] ${error.config?.url || ''}: ${message}`);

    if (status === 401) {
      // token 过期或无效，刷新页面重新登录
      console.warn('认证失效，请重新登录');
    }

    return Promise.reject(new Error(message));
  },
);

export default apiClient;
