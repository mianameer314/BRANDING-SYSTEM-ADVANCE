/**
 * axios setup to use mock service
 */

import axios from "axios";

// Create the base instance without defaults (will be set per-request if needed)
const axiosServices = axios.create({
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

// Interceptor for HTTP Requests
axiosServices.interceptors.request.use(
  (config) => {
    // Attempt to dynamically get runtime config if running inside Nuxt context
    try {
      const { public: configEnv } = useRuntimeConfig();
      if (configEnv.apiBase && !config.baseURL) {
        config.baseURL = configEnv.apiBase as string;
      }
    } catch (e) {
      // Ignored if called outside Nuxt context temporarily
    }

    // Future: JWT token injection goes here
    // const token = useCookie("token").value;
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for HTTP Responses
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error("[API Error] Network Error / No Response");
    } else {
      console.error("[API Error] Request Setup Error:", error.message);
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosServices;
