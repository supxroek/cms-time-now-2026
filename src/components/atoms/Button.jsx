import PropTypes from "prop-types";

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
}) {
  const baseStyles =
    "rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus-ring";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md",
    secondary:
      "bg-white border border-gray-200 text-text-sub hover:bg-gray-50 hover:text-text-main shadow-sm",
    outline: "border border-primary text-primary hover:bg-primary/5",
    danger: "bg-danger text-white hover:opacity-90 shadow-sm",
    warning: "bg-warning text-white hover:opacity-90 shadow-sm",
    success: "bg-success text-white hover:opacity-90 shadow-sm",
    ghost:
      "bg-transparent text-text-sub hover:bg-gray-100 hover:text-text-main",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
    >
      {/* Loading Spinner */}
      {loading && <span className="spinner spinner-sm" aria-hidden="true" />}

      {/* Left Icon */}
      {!loading && icon && iconPosition === "left" && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Children */}
      <span>{children}</span>

      {/* Right Icon */}
      {!loading && icon && iconPosition === "right" && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "danger",
    "warning",
    "success",
    "ghost",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
};
