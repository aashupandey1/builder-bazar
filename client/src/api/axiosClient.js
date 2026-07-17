// Centralized Axios instance + interceptors (auth header, error handling)
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export default axiosClient;
