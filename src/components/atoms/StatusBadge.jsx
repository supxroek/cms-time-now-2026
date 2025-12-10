export function StatusBadge({ status }) {
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "ontime":
      case "working":
      case "present":
        return "bg-status-ontime/10 text-status-ontime border-status-ontime/20";
      case "late":
      case "break":
        return "bg-status-late/10 text-status-late border-status-late/20";
      case "absent":
      case "leave":
      case "offline":
        return "bg-status-absent/10 text-status-absent border-status-absent/20";
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
