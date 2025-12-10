export function Label({ children, htmlFor, className = "", required = false }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-text-main ${className}`}
    >
      {children} {required && <span className="text-danger">*</span>}
    </label>
  );
}
