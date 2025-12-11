import PropTypes from "prop-types";

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

Label.propTypes = {
  children: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
};
