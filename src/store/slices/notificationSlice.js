import { createSlice } from "@reduxjs/toolkit";
// Use browser-safe crypto APIs; avoid importing node:crypto which is externalized by Vite.

/**
 * Notification Types
 * - success: การดำเนินการสำเร็จ (สีเขียว)
 * - error: เกิดข้อผิดพลาด (สีแดง)
 * - warning: คำเตือน (สีเหลือง)
 * - info: ข้อมูลทั่วไป (สีน้ำเงิน)
 */

// กำหนดค่าเริ่มต้น
const initialState = {
  notifications: [], // รายการ notifications ที่แสดงอยู่
  maxNotifications: 5, // จำนวนสูงสุดที่แสดงพร้อมกัน
};

// สร้าง unique ID สำหรับแต่ละ notification (ใช้ CSPRNG แทน Math.random())
const generateId = () => {
  // Prefer crypto.randomUUID if available (modern browsers)
  if (typeof globalThis?.crypto?.randomUUID === "function") {
    return `notif_${Date.now()}_${globalThis.crypto.randomUUID()}`;
  }

  // Fallback to getRandomValues for random hex
  if (typeof globalThis?.crypto?.getRandomValues === "function") {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(6));
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `notif_${Date.now()}_${hex}`;
  }

  // Last resort fallback (non-cryptographic). This path is only used when
  // crypto APIs are unavailable (very old environments). It is NOT
  // cryptographically secure and must never be used for security-sensitive
  // values. We combine several entropy sources and a simple FNV-1a hash to
  // reduce collisions for IDs used purely for UI/visibility purposes.
  const seed = `${Date.now()}_${
    typeof performance !== "undefined" && performance.now
      ? performance.now()
      : 0
  }_${Math.random()}`;
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.codePointAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `notif_${Date.now()}_${hex}`;
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    /**
     * เพิ่ม notification ใหม่
     * @param {Object} action.payload - { type, title, message, duration?, action? }
     */
    addNotification: (state, action) => {
      const {
        type = "info",
        title,
        message,
        duration = 5000, // ค่าเริ่มต้น 5 วินาที
        action: notifAction = null,
        persistent = false, // ไม่หายไปเอง
      } = action.payload;

      const newNotification = {
        id: generateId(),
        type,
        title,
        message,
        duration,
        action: notifAction,
        persistent,
        createdAt: Date.now(),
      };

      // เพิ่ม notification ใหม่ที่ต้นรายการ
      state.notifications.unshift(newNotification);

      // จำกัดจำนวน notifications ที่แสดง
      if (state.notifications.length > state.maxNotifications) {
        // ลบ notifications ที่ไม่ใช่ persistent ออกก่อน
        const nonPersistent = state.notifications.filter((n) => !n.persistent);
        if (nonPersistent.length > state.maxNotifications) {
          state.notifications = [
            ...state.notifications.filter((n) => n.persistent),
            ...nonPersistent.slice(0, state.maxNotifications),
          ];
        }
      }
    },

    /**
     * ลบ notification ตาม ID
     */
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    /**
     * ลบ notifications ทั้งหมด
     */
    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    /**
     * ลบ notifications ตาม type
     */
    clearNotificationsByType: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.type !== action.payload
      );
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearAllNotifications,
  clearNotificationsByType,
} = notificationSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notification.notifications;
export const selectNotificationCount = (state) =>
  state.notification.notifications.length;
export const selectHasNotifications = (state) =>
  state.notification.notifications.length > 0;

export default notificationSlice.reducer;
