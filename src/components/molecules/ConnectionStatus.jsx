import { useOnlineStatus } from "../../hooks/useOnlineStatus";

/**
 * ConnectionStatus Molecule Component
 * แสดงสถานะการเชื่อมต่ออินเทอร์เน็ต
 */
export function ConnectionStatus() {
  const { isOnline, wasOffline } = useOnlineStatus();

  // ไม่แสดงอะไรถ้าออนไลน์ปกติ
  if (isOnline && !wasOffline) {
    return null;
  }

  // แสดงข้อความเมื่อกลับมาออนไลน์
  if (isOnline && wasOffline) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <div className="flex items-center gap-2 px-4 py-2 bg-success text-white rounded-full shadow-float">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">กลับมาออนไลน์แล้ว</span>
        </div>
      </div>
    );
  }

  // แสดงเมื่อออฟไลน์
  return (
    <div className="fixed bottom-0 inset-x-0 z-50">
      <div className="bg-danger text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <svg
            className="w-4 h-4 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
          <span className="text-sm font-medium">
            ไม่มีการเชื่อมต่ออินเทอร์เน็ต - บางฟีเจอร์อาจไม่ทำงาน
          </span>
        </div>
      </div>
    </div>
  );
}

export default ConnectionStatus;
