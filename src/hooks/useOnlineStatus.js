import { useState, useEffect, useCallback } from "react";

/**
 * useOnlineStatus Hook
 * ตรวจสอบสถานะการเชื่อมต่ออินเทอร์เน็ต
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!navigator.onLine) return;
      setWasOffline(true);
      // รีเซ็ต wasOffline หลังจาก 5 วินาที
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    globalThis.addEventListener("online", handleOnline);
    globalThis.addEventListener("offline", handleOffline);

    return () => {
      globalThis.removeEventListener("online", handleOnline);
      globalThis.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}

/**
 * usePageVisibility Hook
 * ตรวจจับเมื่อ user กลับมาที่หน้าเว็บ
 */
export function usePageVisibility(onVisible, onHidden) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        onVisible?.();
      } else {
        onHidden?.();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onVisible, onHidden]);

  return document.visibilityState === "visible";
}

/**
 * useIdleDetection Hook
 * ตรวจจับเมื่อ user ไม่มีการใช้งาน
 */
export function useIdleDetection(options = {}) {
  const { timeout = 5 * 60 * 1000, onIdle, onActive } = options;
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let idleTimer;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      if (isIdle) {
        setIsIdle(false);
        onActive?.();
      }
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        onIdle?.();
      }, timeout);
    };

    // Events ที่แสดงว่า user ยังใช้งานอยู่
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // เริ่ม timer
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [timeout, isIdle, onIdle, onActive]);

  return isIdle;
}

/**
 * useRefreshOnFocus Hook
 * Refresh data เมื่อ user กลับมาที่หน้าเว็บ
 */
export function useRefreshOnFocus(refreshFn, options = {}) {
  const {
    enabled = true,
    minInterval = 60 * 1000, // ไม่ refresh ถี่กว่า 1 นาที
  } = options;

  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const handleVisible = useCallback(() => {
    if (!enabled) return;

    const timeSinceLastRefresh = Date.now() - lastRefresh;
    if (timeSinceLastRefresh >= minInterval) {
      refreshFn?.();
      setLastRefresh(Date.now());
    }
  }, [enabled, lastRefresh, minInterval, refreshFn]);

  usePageVisibility(handleVisible);

  return { lastRefresh };
}

export default useOnlineStatus;
