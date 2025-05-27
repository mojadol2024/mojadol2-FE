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
    const token ='eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyOSIsImlhdCI6MTc0ODM1MzgyOCwiZXhwIjoxNzQ4MzU3NDI4fQ.IE0bCNTWusSZO8GvmQJ3JY-I5-jBuWT5rQZ5OqNb_7U';
     // const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;