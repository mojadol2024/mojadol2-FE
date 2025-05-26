import axios from 'axios';
import { getEnv } from './getEnv';

const BASE_URL = getEnv('BASE_URL', 'http://localhost:4000');

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 요청 시 Authorization 헤더 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('accessToken');
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyOSIsImlhdCI6MTc0ODI4MzU0NSwiZXhwIjoxNzQ4Mjg3MTQ1fQ.ga0AtXdcRzFiNwXgLB4UYineGZxpgj1GWtL1ih58Jt0';
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;