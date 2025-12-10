export function StatusBadge({ status }) {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "ontime":
      case "working":
      case "present":
        return "bg-success/10 text-success border-success/20";
      case "late":
      case "break":
        return "bg-warning/10 text-warning border-warning/20";
      case "absent":
      case "leave":
      case "offline":
        return "bg-danger/10 text-danger border-danger/20";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyles(
        status
      )}`}
    >
      {status || "Unknown"}
    </span>
  );
}
