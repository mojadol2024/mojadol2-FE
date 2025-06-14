import axios from 'axios';
import { getEnv } from './getEnv';

let axiosInstance = null;

export function getAxiosInstance() {
  if (axiosInstance) return axiosInstance;

  const BASE_URL = getEnv('REACT_APP_BASE_URL');

  axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  return axiosInstance;
}

