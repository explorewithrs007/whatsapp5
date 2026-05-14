import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/SearchInput";
import { UserAvatar } from "@/components/UserAvatar";
import { WORKSPACE_USER } from "@/lib/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-14 min-w-0 items-center justify-between gap-3 border-b border-border bg-card/95 px-3 backdrop-blur lg:px-4">
      <SearchInput className="min-w-0 max-w-lg flex-1" placeholder="Search conversations" />
      <div className="flex shrink-0 items-center gap-3">
        <Badge className="hidden border-whatsapp/20 bg-whatsapp-light text-whatsapp-dark sm:inline-flex">
          {WORKSPACE_USER.role}
        </Badge>
        <UserAvatar compact initials={WORKSPACE_USER.initials} name={WORKSPACE_USER.name} />
      </div>
    </header>
  );
}
