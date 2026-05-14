import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = HTMLAttributes<HTMLDivElement>;

export const SectionCard = forwardRef<HTMLDivElement, SectionCardProps>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn("border-t border-border bg-transparent py-4 shadow-none first:border-t-0 2xl:py-5", className)}
    {...props}
  />
));

SectionCard.displayName = "SectionCard";
