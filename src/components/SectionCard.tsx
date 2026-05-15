import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = HTMLAttributes<HTMLDivElement>;

export const SectionCard = forwardRef<HTMLDivElement, SectionCardProps>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn("bg-transparent py-4 first:pt-0 2xl:py-5", className)}
    {...props}
  />
));

SectionCard.displayName = "SectionCard";
