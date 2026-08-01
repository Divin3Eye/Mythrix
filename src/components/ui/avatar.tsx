import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function Avatar({ src, alt, fallback = "U", size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full bg-surface border border-border overflow-hidden text-muted-foreground font-medium",
        {
          "h-7 w-7 text-xs": size === "sm",
          "h-8 w-8 text-xs": size === "md",
          "h-10 w-10 text-sm": size === "lg",
        },
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt || fallback} className="h-full w-full object-cover" />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
}

export { Avatar };
