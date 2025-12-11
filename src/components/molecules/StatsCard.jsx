import PropTypes from "prop-types";

export function StatsCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  color = "primary",
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend === "up"
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger"
            }`}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>
        )}
      </div>
      <h3 className="text-text-muted text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-text-main mt-1">{value}</p>
    </div>
  );
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element.isRequired,
  trend: PropTypes.oneOf(["up", "down"]),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf(["primary", "success", "warning", "danger", "info"]),
};
