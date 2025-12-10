export function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  id,
  className = "",
  error = false,
  disabled = false,
}) {
  const baseStyles =
    "w-full px-4 py-2 border rounded-input focus:outline-none focus:ring-2 transition-all duration-200";
  const stateStyles = error
    ? "border-status-error focus:ring-status-error/20 text-status-error"
    : "border-gray-300 focus:border-brand-primary focus:ring-brand-primary/20 text-text-body";

  return (
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseStyles} ${stateStyles} ${className} disabled:bg-gray-100 disabled:cursor-not-allowed`}
    />
  );
}
