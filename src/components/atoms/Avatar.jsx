
import PropTypes from "prop-types";
 
export function Avatar({ src, alt, size = "md", className = "" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-24 h-24 text-lg",
  };

  const fallbackInitial = alt ? alt.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden bg-gray-200 ${sizes[size]} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`absolute inset-0 flex items-center justify-center font-bold text-gray-500 ${
          src ? "hidden" : "flex"
        }`}
      >
        {fallbackInitial}
      </div>
    </div>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  className: PropTypes.string,
};

Avatar.defaultProps = {
  src: null,
  alt: "",
  size: "md",
  className: "",
};
