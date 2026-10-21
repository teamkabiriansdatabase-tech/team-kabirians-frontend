import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Backend Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface CacheEntry {
  data: any;
  expiry: number;
}

// In-Memory Cache Maps
const memoryCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 Minutes Cache Duration

// Cache clear karne ka utility function
export const clearApiCache = () => {
  memoryCache.clear();
  inFlightRequests.clear();
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Auth Token & URL Redirection (Fixes 404 Results Route)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Auto-redirect /results to /admin/results to prevent 404 Not Found error
    if (config.url) {
      if (config.url === '/results' || config.url === 'results') {
        config.url = '/admin/results';
      } else if (config.url.startsWith('/results/')) {
        config.url = config.url.replace('/results/', '/admin/results/');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Mutation requests par cache auto-clear
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const method = response.config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      clearApiCache();
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearApiCache();
    }
    return Promise.reject(error);
  }
);

// 3. Smart Cached GET Wrapper (TypeScript Error Free)
const originalGet = api.get.bind(api);

(api as any).get = function (url: string, config?: AxiosRequestConfig & { skipCache?: boolean }) {
  // SSR ya explicit skipCache check
  if (typeof window === 'undefined' || config?.skipCache) {
    return originalGet(url, config as AxiosRequestConfig);
  }

  // Unique Cache Key (Token + URL + Query Params)
  const token = localStorage.getItem('token') || 'guest';
  const queryParams = config?.params ? JSON.stringify(config.params) : '';
  const cacheKey = `${token}:${url}:${queryParams}`;

  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  // A. Cache Hit: Instant Data Return
  if (cached && cached.expiry > now) {
    return Promise.resolve({
      data: typeof structuredClone === 'function' ? structuredClone(cached.data) : JSON.parse(JSON.stringify(cached.data)),
      status: 200,
      statusText: 'OK (FROM_CACHE)',
      headers: {},
      config: (config || {}) as any,
    });
  }

  // B. In-flight Deduplication: Multiple parallel calls ko merge karega
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // C. Actual Network Request
  const networkPromise = originalGet(url, config as AxiosRequestConfig)
    .then((res) => {
      memoryCache.set(cacheKey, {
        data: res.data,
        expiry: Date.now() + CACHE_TTL_MS,
      });
      inFlightRequests.delete(cacheKey);
      return res;
    })
    .catch((err) => {
      inFlightRequests.delete(cacheKey);
      throw err;
    });

  inFlightRequests.set(cacheKey, networkPromise);
  return networkPromise;
};

export default api;