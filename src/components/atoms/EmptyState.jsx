import PropTypes from "prop-types";

/**
 * EmptyState Atom Component
 * แสดงเมื่อไม่มีข้อมูล
 */
export function EmptyState({
  icon,
  title = "ไม่พบข้อมูล",
  message,
  action,
  className = "",
}) {
  // Default icon
  const defaultIcon = (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {/* Icon */}
      <div className="text-text-muted mb-4">{icon || defaultIcon}</div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-main mb-1">{title}</h3>

      {/* Message */}
      {message && (
        <p className="text-sm text-text-sub max-w-sm mb-4">{message}</p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-text-inv rounded-lg hover:bg-primary-hover transition-colors focus-ring"
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  message: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    icon: PropTypes.node,
  }),
  className: PropTypes.string,
};

/**
 * NoResults Component
 * แสดงเมื่อค้นหาไม่พบ
 */
export function NoResults({ searchTerm, onClear, className = "" }) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="ไม่พบผลลัพธ์"
      message={
        searchTerm
          ? `ไม่พบผลลัพธ์สำหรับ "${searchTerm}"`
          : "ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา"
      }
      action={
        onClear
          ? {
              label: "ล้างการค้นหา",
              onClick: onClear,
              icon: (
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
              ),
            }
          : undefined
      }
      className={className}
    />
  );
}

NoResults.propTypes = {
  searchTerm: PropTypes.string,
  onClear: PropTypes.func,
  className: PropTypes.string,
};

/**
 * ErrorState Component
 * แสดงเมื่อเกิดข้อผิดพลาดในการโหลดข้อมูล
 */
export function ErrorState({
  title = "เกิดข้อผิดพลาด",
  message = "ไม่สามารถโหลดข้อมูลได้",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {/* Error Icon */}
      <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-danger"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-main mb-1">{title}</h3>

      {/* Message */}
      <p className="text-sm text-text-sub max-w-sm mb-4">{message}</p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-text-inv rounded-lg hover:bg-primary-hover transition-colors focus-ring"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          ลองใหม่
        </button>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};
