export function Label({ children, htmlFor, className = "", required = false }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-text-header ${className}`}
    >
      {children} {required && <span className="text-status-error">*</span>}
    </label>
  );
}
