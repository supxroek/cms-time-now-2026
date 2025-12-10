import { Avatar } from "../atoms/Avatar";

export function UserProfile({
  name,
  role,
  avatarUrl,
  size = "md",
  className = "",
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Avatar src={avatarUrl} alt={name} size={size} />
      <div className="flex flex-col">
        <span className="font-semibold text-text-main leading-tight">
          {name}
        </span>
        {role && <span className="text-xs text-text-muted">{role}</span>}
      </div>
    </div>
  );
}
