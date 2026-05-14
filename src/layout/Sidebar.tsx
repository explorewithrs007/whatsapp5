import { MessageSquareText } from "lucide-react";
import { navigationGroups } from "@/lib/navigation";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SidebarProps = {
  activePath: string;
  onNavigate?: (path: string) => void;
};

export function Sidebar({ activePath, onNavigate }: SidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-whatsapp-light text-whatsapp-dark">
          <MessageSquareText className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{APP_NAME}</p>
          <p className="text-xs text-muted-foreground">Frontend MVP</p>
        </div>
      </div>

      <nav className="subtle-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-4 pr-2">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-xs font-semibold uppercase tracking-normal text-muted">
              {group.label}
            </p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const isActive = item.path === activePath;
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      isActive
                        ? "bg-whatsapp-light text-whatsapp-dark"
                        : "text-muted-foreground hover:bg-slate-50 hover:text-foreground",
                    )}
                    onClick={() => onNavigate?.(item.path)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
