import PropTypes from "prop-types";

/**
 * Loading Spinner Atom Component
 * แสดงสถานะกำลังโหลด
 */
export function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "spinner-sm",
    md: "",
    lg: "spinner-lg",
  };

  return (
    <output
      className={`spinner ${sizeClasses[size]} ${className}`}
      aria-label="กำลังโหลด"
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};

/**
 * Loading Overlay Component
 * แสดง overlay ขณะโหลด
 */
export function LoadingOverlay({ message = "กำลังโหลด..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-surface rounded-lg shadow-float p-6 flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-sub">{message}</p>
      </div>
    </div>
  );
}

LoadingOverlay.propTypes = {
  message: PropTypes.string,
};

/**
 * Loading Card Component
 * แสดงสถานะโหลดในพื้นที่เฉพาะ
 */
export function LoadingCard({ message = "กำลังโหลดข้อมูล..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
      <Spinner size="lg" />
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  );
}

LoadingCard.propTypes = {
  message: PropTypes.string,
};

/**
 * Skeleton Loading Component
 * แสดง placeholder ขณะโหลด
 */
export function Skeleton({ variant = "text", width, height, className = "" }) {
  const variantClasses = {
    text: "skeleton-text",
    avatar: "skeleton-avatar",
    button: "skeleton-button",
    card: "skeleton-card",
    custom: "skeleton",
  };

  const style = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height)
    style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

Skeleton.propTypes = {
  variant: PropTypes.oneOf(["text", "avatar", "button", "card", "custom"]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
};

/**
 * Skeleton List Component
 * แสดง skeleton หลายแถว
 */
export function SkeletonList({ rows = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={`skeleton-row-${index}`} className="flex items-center gap-3">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

SkeletonList.propTypes = {
  rows: PropTypes.number,
  className: PropTypes.string,
};

/**
 * Skeleton Table Component
 * แสดง skeleton สำหรับตาราง
 */
export function SkeletonTable({ rows = 5, columns = 4, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 p-3 bg-background rounded-lg">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={`header-col-${index}`}
            variant="text"
            className="flex-1"
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`table-row-${rowIndex}`} className="flex gap-4 p-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

SkeletonTable.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
  className: PropTypes.string,
};
