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
        <label htmlFor={id} className="text-sm font-medium text-text-main">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <Input id={id} error={!!error} {...inputProps} />
      {error && (
        <span className="text-xs text-danger animate-pulse">{error}</span>
      )}
    </div>
  );
}
