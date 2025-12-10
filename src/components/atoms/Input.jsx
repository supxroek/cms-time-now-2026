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
    "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 bg-white shadow-sm";
  const stateStyles = error
    ? "border-danger focus:ring-danger/20 text-danger"
    : "border-gray-200 text-text-main focus:border-primary focus:ring-primary/20";

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
