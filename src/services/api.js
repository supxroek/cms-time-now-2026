import axios from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../config/constants";

/**
 * API Service Layer
 * จัดการ HTTP requests พร้อมฟีเจอร์:
 * - Request/Response Interceptors
 * - Automatic Token Refresh
 * - Request Caching
 * - Request Deduplication
 * - Retry Logic with Exponential Backoff
 * - Error Handling
 */

// ===== CONFIGURATION =====
const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 นาที
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 วินาที

// ===== CACHE STORAGE =====
const cache = new Map();
const pendingRequests = new Map();

// ===== AXIOS INSTANCE =====
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== REQUEST INTERCEPTOR =====
apiClient.interceptors.request.use(
  (config) => {
    // เพิ่ม Authorization header ถ้ามี token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // เพิ่ม timestamp สำหรับการ debug
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR =====
apiClient.interceptors.response.use(
  (response) => {
    // Log response time (สำหรับ development)
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.debug(
        `[API] ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${duration}ms`
      );
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // ลองรีเฟรช token (ถ้ามี refresh token endpoint)
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );
          const { token } = response.data.data;
          localStorage.setItem("token", token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh ล้มเหลว - ล้าง token และ redirect ไปหน้า login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
        globalThis.location.href = "/login";
        throw refreshError;
      }
    }

    throw error;
  }
);

// ===== CACHE UTILITIES =====

/**
 * สร้าง cache key จาก request config
 */
const getCacheKey = (config) => {
  const { method, url, params, data } = config;
  return `${method}_${url}_${JSON.stringify(params || {})}_${JSON.stringify(
    data || {}
  )}`;
};

/**
 * ดึงข้อมูลจาก cache
 */
const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  // ลบ cache ที่หมดอายุ
  if (cached) {
    cache.delete(key);
  }
  return null;
};

/**
 * เก็บข้อมูลลง cache
 */
const setCache = (key, data, ttl = DEFAULT_CACHE_TIME) => {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl,
  });
};

/**
 * ล้าง cache ทั้งหมด
 */
export const clearCache = () => {
  cache.clear();
};

/**
 * ล้าง cache ที่ match กับ pattern
 */
export const clearCacheByPattern = (pattern) => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// ===== REQUEST DEDUPLICATION =====

/**
 * จัดการ request ที่ซ้ำกัน (เช่น user กดปุ่มหลายครั้ง)
 */
const deduplicateRequest = async (key, requestFn) => {
  // ถ้ามี request ที่ pending อยู่แล้ว ให้รอ request นั้นแทน
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // สร้าง request ใหม่
  const requestPromise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, requestPromise);
  return requestPromise;
};

// ===== RETRY LOGIC =====

/**
 * Retry request ด้วย exponential backoff
 */
const retryRequest = async (fn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  try {
    return await fn();
  } catch (error) {
    // ไม่ retry ถ้าเป็น client error (4xx) ยกเว้น 408 (Request Timeout) และ 429 (Too Many Requests)
    const status = error.response?.status;
    if (
      status &&
      status >= 400 &&
      status < 500 &&
      status !== 408 &&
      status !== 429
    ) {
      throw error;
    }

    if (retries === 0) {
      throw error;
    }

    // รอด้วย exponential backoff
    await new Promise((resolve) => setTimeout(resolve, delay));

    return retryRequest(fn, retries - 1, delay * 2);
  }
};

// ===== API METHODS =====

/**
 * GET request พร้อม caching
 * @param {string} url - endpoint URL
 * @param {Object} options - { params, cache, cacheTTL, retry }
 */
export const apiGet = async (url, options = {}) => {
  const {
    params = {},
    cache: useCache = true,
    cacheTTL = DEFAULT_CACHE_TIME,
    retry = true,
  } = options;

  const config = { method: "get", url, params };
  const cacheKey = getCacheKey(config);

  // ตรวจสอบ cache
  if (useCache) {
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // ทำ request พร้อม deduplication
  const requestFn = async () => {
    const response = await apiClient.get(url, { params });
    return response.data;
  };

  const makeRequest = retry ? () => retryRequest(requestFn) : requestFn;

  const data = await deduplicateRequest(cacheKey, makeRequest);

  // เก็บ cache
  if (useCache) {
    setCache(cacheKey, data, cacheTTL);
  }

  return data;
};

/**
 * POST request
 */
export const apiPost = async (url, data = {}, options = {}) => {
  const { retry = false } = options;

  const requestFn = async () => {
    const response = await apiClient.post(url, data);
    return response.data;
  };

  // ล้าง cache ที่เกี่ยวข้อง
  clearCacheByPattern(url.split("/")[1]); // ล้าง cache ของ resource นั้น

  return retry ? retryRequest(requestFn) : requestFn();
};

/**
 * PUT request
 */
export const apiPut = async (url, data = {}, options = {}) => {
  const { retry = false } = options;

  const requestFn = async () => {
    const response = await apiClient.put(url, data);
    return response.data;
  };

  clearCacheByPattern(url.split("/")[1]);
  return retry ? retryRequest(requestFn) : requestFn();
};

/**
 * PATCH request
 */
export const apiPatch = async (url, data = {}, options = {}) => {
  const { retry = false } = options;

  const requestFn = async () => {
    const response = await apiClient.patch(url, data);
    return response.data;
  };

  clearCacheByPattern(url.split("/")[1]);
  return retry ? retryRequest(requestFn) : requestFn();
};

/**
 * DELETE request
 */
export const apiDelete = async (url, options = {}) => {
  const { retry = false } = options;

  const requestFn = async () => {
    const response = await apiClient.delete(url);
    return response.data;
  };

  clearCacheByPattern(url.split("/")[1]);
  return retry ? retryRequest(requestFn) : requestFn();
};

// ===== ERROR PARSER =====

/**
 * แปลง error เป็นข้อความที่เข้าใจง่าย
 */
export const parseApiError = (error) => {
  // Network error
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return {
        title: "หมดเวลาการเชื่อมต่อ",
        message: "เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง",
        type: "error",
      };
    }
    return {
      title: "ไม่สามารถเชื่อมต่อได้",
      message: "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
      type: "error",
    };
  }

  const status = error.response.status;
  const serverMessage =
    error.response.data?.error || error.response.data?.message;

  // Map status codes to user-friendly messages
  const statusMessages = {
    400: {
      title: "ข้อมูลไม่ถูกต้อง",
      message: serverMessage || "กรุณาตรวจสอบข้อมูลที่กรอก",
    },
    401: { title: "ไม่ได้รับอนุญาต", message: "กรุณาเข้าสู่ระบบใหม่" },
    403: {
      title: "ไม่มีสิทธิ์เข้าถึง",
      message: "คุณไม่มีสิทธิ์ในการดำเนินการนี้",
    },
    404: {
      title: "ไม่พบข้อมูล",
      message: serverMessage || "ไม่พบข้อมูลที่ต้องการ",
    },
    409: {
      title: "ข้อมูลซ้ำ",
      message: serverMessage || "มีข้อมูลนี้ในระบบแล้ว",
    },
    422: {
      title: "ข้อมูลไม่สมบูรณ์",
      message: serverMessage || "กรุณากรอกข้อมูลให้ครบถ้วน",
    },
    429: { title: "คำขอมากเกินไป", message: "กรุณารอสักครู่แล้วลองใหม่" },
    500: {
      title: "เกิดข้อผิดพลาด",
      message: "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ภายหลัง",
    },
    502: { title: "เซิร์ฟเวอร์ไม่พร้อมใช้งาน", message: "กรุณาลองใหม่ภายหลัง" },
    503: {
      title: "บริการไม่พร้อมใช้งาน",
      message: "ระบบกำลังปรับปรุง กรุณาลองใหม่ภายหลัง",
    },
  };

  const errorInfo = statusMessages[status] || {
    title: "เกิดข้อผิดพลาด",
    message: serverMessage || "กรุณาลองใหม่อีกครั้ง",
  };

  return {
    ...errorInfo,
    type: "error",
    status,
  };
};

// ===== EXPORT API CLIENT =====
export { apiClient };
export default apiClient;

// ===== Convenience API helpers for auth flows =====
/**
 * Request password reset - sends reset link to email
 * @param {{email: string}} payload
 */
export const requestPasswordReset = async (payload) => {
  // endpoint assumed: POST /auth/forgot-password
  const res = await apiPost("/auth/forgot-password", payload);
  return res;
};

/**
 * Reset password using token (or data object)
 * @param {{token?: string, password: string}} payload
 */
export const resetPassword = async (payload) => {
  // endpoint assumed: POST /auth/reset-password
  const res = await apiPost("/auth/reset-password", payload);
  return res;
};
