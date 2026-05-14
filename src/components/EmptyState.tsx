import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function EmptyState({ title, description, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <SectionCard className="flex min-h-56 flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-slate-50 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </SectionCard>
  );
}
