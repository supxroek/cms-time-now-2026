import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  UserCheckIcon,
  UserXIcon,
  ClockIcon,
  RequestsIcon,
  ReportsIcon,
} from "../atoms/Icons";

export function NotificationDropdown({ isOpen, onClose, notifications = [] }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getTypeClasses = (type) => {
    switch (type) {
      case "success":
        return "bg-success/10 text-success";
      case "warning":
        return "bg-warning/10 text-warning";
      case "error":
        return "bg-danger/10 text-danger";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden animate-fade-in origin-top-right"
    >
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <h3 className="font-semibold text-text-main">การแจ้งเตือน</h3>
        {notifications.length > 0 && (
          <button className="text-xs text-primary cursor-pointer hover:underline font-medium">
            อ่านทั้งหมด
          </button>
        )}
      </div>

      <div className="max-h-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-text-sub flex flex-col items-center justify-center min-h-50">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
              <RequestsIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-text-main">
              ไม่มีการแจ้งเตือนใหม่
            </p>
            <p className="text-xs text-text-muted mt-1">
              คุณจะได้รับการแจ้งเตือนเมื่อมีความเคลื่อนไหว
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((noti) => (
              <div
                key={noti.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group relative ${
                  noti.read ? "" : "bg-blue-50/30"
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`mt-1 p-2 rounded-full shrink-0 h-fit ${getTypeClasses(
                      noti.type
                    )}`}
                  >
                    {getIcon(noti.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium text-text-main truncate group-hover:text-primary transition-colors">
                        {noti.title}
                      </p>
                      {!noti.read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-text-sub mt-0.5 line-clamp-2 leading-relaxed">
                      {noti.message}
                    </p>
                    <p className="text-[10px] text-text-muted mt-2 font-medium">
                      {noti.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          {/* <button className="text-xs text-text-sub font-medium w-full h-full">
            ดูประวัติทั้งหมด
          </button> */}
        </div>
      )}
    </div>
  );
}

function getIcon(type) {
  switch (type) {
    case "success":
      return <UserCheckIcon className="w-4 h-4" />;
    case "error":
      return <UserXIcon className="w-4 h-4" />;
    case "warning":
      return <ClockIcon className="w-4 h-4" />;
    default:
      return <ReportsIcon className="w-4 h-4" />;
  }
}

NotificationDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.string,
      title: PropTypes.string.isRequired,
      message: PropTypes.string,
      time: PropTypes.string,
      read: PropTypes.bool,
    })
  ),
};
