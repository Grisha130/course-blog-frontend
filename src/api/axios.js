import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  },
});

export const getCsrfCookie = () => axios.get('/sanctum/csrf-cookie', { withCredentials: true });

export default api;