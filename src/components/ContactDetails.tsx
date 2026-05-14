import type { ReactNode } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

export function ContactIdentityBlock({
  avatarUrl,
  initials,
  name,
  phone,
}: {
  avatarUrl?: string;
  initials: string;
  name: string;
  phone: string;
}) {
  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      <UserAvatar avatarUrl={avatarUrl} compact initials={initials} name={name} size="lg" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{phone}</p>
      </div>
    </div>
  );
}

export function DetailField({
  children,
  className,
  label,
  value,
}: {
  children?: ReactNode;
  className?: string;
  label: string;
  value?: ReactNode;
}) {
  return (
    <div className={cn("w-full min-w-0", className)}>
      <p className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</p>
      {children ?? <div className="mt-2 text-sm leading-6 text-foreground">{value}</div>}
    </div>
  );
}

export function DetailTagList({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return <p className="mt-2 text-sm text-muted-foreground">Not available</p>;
  }

  return (
    <div className="mt-2 flex w-full flex-wrap gap-2">
      {tags.map((tag) => (
        <span key={tag} className="rounded-full border border-border bg-slate-50 px-2.5 py-1 text-xs text-muted-foreground">
          {tag}
        </span>
      ))}
    </div>
  );
}

export function InternalNoteCard({
  author,
  className,
  content,
  timestamp,
}: {
  author: string;
  className?: string;
  content: string;
  timestamp: string;
}) {
  return (
    <div className={cn("w-full min-w-0 rounded-xl border border-border bg-slate-50 p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{author}</p>
        <span className="shrink-0 text-xs text-muted">{timestamp}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{content}</p>
    </div>
  );
}
