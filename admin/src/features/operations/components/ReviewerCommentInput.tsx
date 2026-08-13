import { cn } from "@/utils/utils";

interface ReviewerCommentInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function ReviewerCommentInput({
  value,
  onChange,
  required = false,
  placeholder = "Add a comment...",
  label = "Comment",
  className = "",
}: ReviewerCommentInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={cn(
          "w-full text-sm border border-input rounded-md bg-card text-foreground py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:bg-accent/50 transition-colors resize-y",
          required && "border-primary/50"
        )}
      />
      {required && !value.trim() && (
        <p className="text-xs text-destructive">A comment is required for this action.</p>
      )}
    </div>
  );
}
