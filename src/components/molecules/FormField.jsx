import { Input } from "../atoms/Input";

export function FormField({
  label,
  error,
  id,
  required = false,
  className = "",
  ...inputProps
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-header">
          {label} {required && <span className="text-status-error">*</span>}
        </label>
      )}
      <Input id={id} error={!!error} {...inputProps} />
      {error && (
        <span className="text-xs text-status-error animate-pulse">{error}</span>
      )}
    </div>
  );
}
