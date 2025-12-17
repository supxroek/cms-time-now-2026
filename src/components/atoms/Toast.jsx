import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  selectNotifications,
  removeNotification,
} from "../../store/slices/notificationSlice";

/**
 * Toast Atom Component
 * แสดงข้อความแจ้งเตือนแต่ละรายการ
 */
function ToastItem({ notification, onDismiss }) {
  const { id, type, title, message, duration, persistent, action } =
    notification;

  // Auto-dismiss after duration
  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, persistent, onDismiss]);

  // Icon และ Style ตาม type
  const typeConfig = {
    success: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      bgClass: "bg-success/10 border-success/30",
      iconClass: "text-success",
      progressClass: "bg-success",
    },
    error: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
      bgClass: "bg-danger/10 border-danger/30",
      iconClass: "text-danger",
      progressClass: "bg-danger",
    },
    warning: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      bgClass: "bg-warning/10 border-warning/30",
      iconClass: "text-warning",
      progressClass: "bg-warning",
    },
    info: {
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgClass: "bg-info/10 border-info/30",
      iconClass: "text-info",
      progressClass: "bg-info",
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className={`
        toast-item relative flex items-start gap-3 p-4 rounded-lg border
        bg-surface shadow-float
        ${config.bgClass}
        animate-toast-in
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={`shrink-0 ${config.iconClass}`}>{config.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold text-text-main">{title}</p>
        )}
        {message && <p className="text-sm text-text-sub mt-0.5">{message}</p>}

        {/* Action Button */}
        {action && (
          <button
            onClick={() => {
              action.onClick?.();
              onDismiss(id);
            }}
            className="mt-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 p-1 rounded-md text-text-muted hover:text-text-sub hover:bg-black/5 transition-colors"
        aria-label="ปิด"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Progress Bar (ถ้าไม่ใช่ persistent) */}
      {!persistent && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-lg">
          <div
            className={`h-full ${config.progressClass} animate-progress-shrink`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}

ToastItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["success", "error", "warning", "info"]),
    title: PropTypes.string,
    message: PropTypes.string,
    duration: PropTypes.number,
    persistent: PropTypes.bool,
    action: PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    }),
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

/**
 * Toast Container Component
 * แสดงรายการ notifications ทั้งหมด
 */
export function Toast({ position = "top-right" }) {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  const handleDismiss = useCallback(
    (id) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  // Position classes
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        fixed z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none
        ${positionClasses[position] || positionClasses["top-right"]}
      `}
      aria-label="การแจ้งเตือน"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <ToastItem notification={notification} onDismiss={handleDismiss} />
        </div>
      ))}
    </div>
  );
}

Toast.propTypes = {
  position: PropTypes.oneOf([
    "top-right",
    "top-left",
    "top-center",
    "bottom-right",
    "bottom-left",
    "bottom-center",
  ]),
};
