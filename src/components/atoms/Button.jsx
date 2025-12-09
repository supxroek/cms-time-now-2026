import PropTypes from "prop-types";

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const baseStyles =
    "px-4 py-2 rounded-btn font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-primary-hover",
    secondary: "bg-gray-200 text-text-body hover:bg-gray-300",
    outline:
      "border border-brand-primary text-brand-primary hover:bg-brand-primary/10",
    danger: "bg-status-error text-white hover:opacity-90",
    ghost: "bg-transparent text-text-body hover:bg-gray-100",
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

Button.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "danger",
    "ghost",
  ]),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};
