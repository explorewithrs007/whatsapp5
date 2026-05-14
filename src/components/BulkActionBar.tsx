import { Button, type ButtonProps } from "@/components/ui/button";

export type BulkActionBarAction = {
  label: string;
  onClick: () => void;
  variant?: ButtonProps["variant"];
};

type BulkActionBarProps = {
  actions: BulkActionBarAction[];
  label?: string;
  onClearSelection: () => void;
  selectedCount: number;
};

export function BulkActionBar({
  actions,
  label,
  onClearSelection,
  selectedCount,
}: BulkActionBarProps) {
  if (!selectedCount) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 lg:left-[19.5rem] lg:right-8">
      <div className="mx-auto flex max-w-[1920px] flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-foreground">{label ?? `${selectedCount} rows selected`}</p>
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.label}
              onClick={action.onClick}
              size="sm"
              variant={action.variant ?? "outline"}
            >
              {action.label}
            </Button>
          ))}
          <Button onClick={onClearSelection} size="sm" variant="ghost">
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
