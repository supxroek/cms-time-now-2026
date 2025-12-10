export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md",
    secondary:
      "bg-white border border-gray-200 text-text-sub hover:bg-gray-50 hover:text-text-main shadow-sm",
    outline: "border border-primary text-primary hover:bg-primary/5",
    danger: "bg-danger text-white hover:opacity-90 shadow-sm",
    ghost:
      "bg-transparent text-text-sub hover:bg-gray-100 hover:text-text-main",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
