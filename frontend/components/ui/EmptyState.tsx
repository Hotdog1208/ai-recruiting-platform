import Image from "next/image";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  imageSrc,
  imageAlt = "",
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {imageSrc && (
        <div className="relative w-48 h-32 sm:w-56 sm:h-40 mb-6 text-zinc-500">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-contain object-center"
          />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-zinc-400 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && <div className="mb-4">{action}</div>}
      {children}
    </div>
  );
}
