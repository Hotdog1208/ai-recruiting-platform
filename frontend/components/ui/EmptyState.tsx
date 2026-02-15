import Image from "next/image";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Emoji or icon to show when no image (e.g. "📭", "📂") */
  icon?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  imageSrc,
  imageAlt = "",
  icon,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "empty-state flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {imageSrc ? (
        <div className="empty-illustration relative w-48 h-32 sm:w-56 sm:h-40 mb-6">
          {imageSrc.startsWith("https://") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={imageAlt || title}
              className="object-contain object-center opacity-80 w-full h-full"
            />
          ) : (
            <Image
              src={imageSrc}
              alt={imageAlt || title}
              fill
              className="object-contain object-center opacity-80"
            />
          )}
        </div>
      ) : icon ? (
        <div className="empty-icon text-5xl sm:text-6xl mb-4 opacity-50" aria-hidden>
          {icon}
        </div>
      ) : null}
      <h3 className="empty-title text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="empty-description text-zinc-400 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && <div className="mb-4">{action}</div>}
      {children}
    </div>
  );
}
