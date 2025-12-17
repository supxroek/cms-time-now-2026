import { useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  addNotification,
  removeNotification,
  clearAllNotifications,
} from "../store/slices/notificationSlice";

/**
 * useNotification Hook
 * Custom hook สำหรับจัดการ notifications อย่างง่ายดาย
 *
 * @example
 * const { notify, success, error, warning, info, dismiss, clearAll } = useNotification();
 *
 * // แสดง notification แบบกำหนดเอง
 * notify({ type: 'success', title: 'สำเร็จ', message: 'บันทึกข้อมูลแล้ว' });
 *
 * // แสดง notification แบบลัด
 * success('บันทึกข้อมูลสำเร็จ');
 * error('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกได้');
 */
export function useNotification() {
  const dispatch = useDispatch();

  /**
   * แสดง notification แบบกำหนดเอง
   */
  const notify = useCallback(
    (options) => {
      dispatch(addNotification(options));
    },
    [dispatch]
  );

  /**
   * แสดง success notification
   */
  const success = useCallback(
    (title, message, options = {}) => {
      dispatch(
        addNotification({
          type: "success",
          title,
          message,
          ...options,
        })
      );
    },
    [dispatch]
  );

  /**
   * แสดง error notification
   */
  const error = useCallback(
    (title, message, options = {}) => {
      dispatch(
        addNotification({
          type: "error",
          title,
          message,
          duration: 8000, // error แสดงนานขึ้น
          ...options,
        })
      );
    },
    [dispatch]
  );

  /**
   * แสดง warning notification
   */
  const warning = useCallback(
    (title, message, options = {}) => {
      dispatch(
        addNotification({
          type: "warning",
          title,
          message,
          ...options,
        })
      );
    },
    [dispatch]
  );

  /**
   * แสดง info notification
   */
  const info = useCallback(
    (title, message, options = {}) => {
      dispatch(
        addNotification({
          type: "info",
          title,
          message,
          ...options,
        })
      );
    },
    [dispatch]
  );

  /**
   * ปิด notification ตาม ID
   */
  const dismiss = useCallback(
    (id) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  /**
   * ปิด notifications ทั้งหมด
   */
  const clearAll = useCallback(() => {
    dispatch(clearAllNotifications());
  }, [dispatch]);

  /**
   * แสดง notification พร้อม action button
   */
  const withAction = useCallback(
    (type, title, message, actionLabel, actionCallback, options = {}) => {
      dispatch(
        addNotification({
          type,
          title,
          message,
          persistent: true, // notification พร้อม action ไม่หายไปเอง
          action: {
            label: actionLabel,
            onClick: actionCallback,
          },
          ...options,
        })
      );
    },
    [dispatch]
  );

  /**
   * แสดง promise notification (pending -> success/error)
   */
  const promise = useCallback(
    async (
      promiseFn,
      {
        pending = { title: "กำลังดำเนินการ...", message: "กรุณารอสักครู่" },
        success: successMsg = {
          title: "สำเร็จ",
          message: "ดำเนินการเรียบร้อย",
        },
        error: errorMsg = {
          title: "เกิดข้อผิดพลาด",
          message: "ไม่สามารถดำเนินการได้",
        },
      } = {}
    ) => {
      // แสดง pending notification
      const pendingId = `pending_${Date.now()}`;
      dispatch(
        addNotification({
          id: pendingId,
          type: "info",
          ...pending,
          persistent: true,
        })
      );

      try {
        const result = await promiseFn();

        // ลบ pending และแสดง success
        dispatch(removeNotification(pendingId));
        dispatch(
          addNotification({
            type: "success",
            ...successMsg,
          })
        );

        return result;
      } catch (err) {
        // ลบ pending และแสดง error
        dispatch(removeNotification(pendingId));
        dispatch(
          addNotification({
            type: "error",
            title: errorMsg.title,
            message: err.message || errorMsg.message,
            duration: 8000,
          })
        );

        throw err;
      }
    },
    [dispatch]
  );

  return {
    notify,
    success,
    error,
    warning,
    info,
    dismiss,
    clearAll,
    withAction,
    promise,
  };
}

export default useNotification;
