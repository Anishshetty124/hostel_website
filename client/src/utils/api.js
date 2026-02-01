import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // if you use cookies/auth
});

// Add a response interceptor to log errors in detail
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Log error details to the browser console
      console.error('[API ERROR]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('[API ERROR] No response received', error.request);
    } else {
      console.error('[API ERROR] Request setup error', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
