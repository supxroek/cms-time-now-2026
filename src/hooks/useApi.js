import { useState, useCallback, useRef, useEffect } from "react";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
  parseApiError,
  clearCacheByPattern,
} from "../services/api";
import { useNotification } from "./useNotification";

/**
 * useApi Hook
 * Custom hook สำหรับจัดการ API calls พร้อม:
 * - Loading state
 * - Error handling
 * - Caching
 * - Auto notification
 * - Request cancellation
 *
 * @example
 * const { data, isLoading, error, execute, refresh } = useApi('/employees');
 */
export function useApi(endpoint, options = {}) {
  const {
    method = "GET",
    immediate = false, // เรียก API ทันทีเมื่อ mount
    initialData = null,
    cache = true,
    cacheTTL = 5 * 60 * 1000, // 5 นาที
    showNotification = false, // แสดง notification เมื่อสำเร็จ/ล้มเหลว
    successMessage = null,
    onSuccess = null,
    onError = null,
    transform = null, // แปลงข้อมูลก่อนเก็บ
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { success, error: showError } = useNotification();
  const abortControllerRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Execute API call
   */
  const execute = useCallback(
    async (payload = null, customEndpoint = null) => {
      // Cancel previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      const targetEndpoint = customEndpoint || endpoint;

      try {
        let response;

        switch (method.toUpperCase()) {
          case "GET":
            response = await apiGet(targetEndpoint, { cache, cacheTTL });
            break;
          case "POST":
            response = await apiPost(targetEndpoint, payload);
            break;
          case "PATCH":
            response = await apiPatch(targetEndpoint, payload);
            break;
          case "PUT":
            response = await apiPatch(targetEndpoint, payload);
            break;
          case "DELETE":
            response = await apiDelete(targetEndpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        // Only update state if component is still mounted
        if (!mountedRef.current) return;

        const result = response.data || response;
        const transformedData = transform ? transform(result) : result;

        setData(transformedData);

        // Show success notification
        if (showNotification && successMessage) {
          success(successMessage.title || "สำเร็จ", successMessage.message);
        }

        // Call onSuccess callback
        onSuccess?.(transformedData);

        return transformedData;
      } catch (err) {
        if (!mountedRef.current) return;

        const parsedError = parseApiError(err);
        setError(parsedError);

        // Show error notification
        if (showNotification) {
          showError(parsedError.title, parsedError.message);
        }

        // Call onError callback
        onError?.(parsedError);

        throw parsedError;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [
      endpoint,
      method,
      cache,
      cacheTTL,
      showNotification,
      successMessage,
      success,
      showError,
      onSuccess,
      onError,
      transform,
    ]
  );

  /**
   * Refresh data (clear cache and re-fetch)
   */
  const refresh = useCallback(async () => {
    clearCacheByPattern(endpoint);
    return execute();
  }, [endpoint, execute]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setIsLoading(false);
  }, [initialData]);

  // Auto fetch on mount if immediate is true
  useEffect(() => {
    if (immediate && endpoint) {
      execute();
    }
  }, [immediate, endpoint, execute]);

  return {
    data,
    isLoading,
    error,
    execute,
    refresh,
    reset,
    setData,
  };
}

/**
 * usePaginatedApi Hook
 * สำหรับ API ที่มี pagination
 */
export function usePaginatedApi(endpoint, options = {}) {
  const { pageSize = 20, initialPage = 1, ...apiOptions } = options;

  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const {
    data,
    isLoading,
    error,
    execute,
    reset: resetApi,
  } = useApi(endpoint, {
    ...apiOptions,
    immediate: false,
    transform: (response) => {
      // สมมติว่า API ส่งกลับ { data: [], pagination: { page, totalPages, totalItems } }
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalItems(response.pagination.totalItems || 0);
      }
      return response.data || response;
    },
  });

  const fetchPage = useCallback(
    async (pageNum) => {
      const result = await execute(
        null,
        `${endpoint}?page=${pageNum}&limit=${pageSize}`
      );
      setPage(pageNum);
      return result;
    },
    [endpoint, pageSize, execute]
  );

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      return fetchPage(page + 1);
    }
  }, [page, totalPages, fetchPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      return fetchPage(page - 1);
    }
  }, [page, fetchPage]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setTotalPages(1);
    setTotalItems(0);
    resetApi();
  }, [initialPage, resetApi]);

  return {
    data: data || [],
    isLoading,
    error,
    page,
    totalPages,
    totalItems,
    pageSize,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    fetchPage,
    nextPage,
    prevPage,
    reset,
  };
}

/**
 * useDebounceApi Hook
 * สำหรับ API calls ที่ต้องการ debounce (เช่น search)
 */
export function useDebounceApi(endpoint, delay = 300, options = {}) {
  const [debouncedValue, setDebouncedValue] = useState("");
  const timerRef = useRef(null);

  const api = useApi(endpoint, {
    ...options,
    immediate: false,
  });

  const search = useCallback(
    (value) => {
      setDebouncedValue(value);

      // Clear previous timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer
      timerRef.current = setTimeout(() => {
        if (value.trim()) {
          api.execute(null, `${endpoint}?q=${encodeURIComponent(value)}`);
        } else {
          api.reset();
        }
      }, delay);
    },
    [endpoint, delay, api]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    ...api,
    search,
    searchValue: debouncedValue,
  };
}

/**
 * usePollingApi Hook
 * สำหรับ API ที่ต้องการ auto-refresh ตามเวลา
 */
export function usePollingApi(endpoint, interval = 30000, options = {}) {
  const { enabled = true, stopOnError = true, ...apiOptions } = options;

  const api = useApi(endpoint, apiOptions);
  const intervalRef = useRef(null);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (enabled && (!stopOnError || !api.error)) {
        api.execute();
      }
    }, interval);
  }, [enabled, stopOnError, interval, api]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto start/stop based on enabled state
  useEffect(() => {
    if (enabled) {
      api.execute(); // Initial fetch
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop on error if configured
  useEffect(() => {
    if (stopOnError && api.error) {
      stopPolling();
    }
  }, [api.error, stopOnError, stopPolling]);

  return {
    ...api,
    startPolling,
    stopPolling,
  };
}

export default useApi;
