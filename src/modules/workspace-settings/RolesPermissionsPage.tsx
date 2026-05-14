import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { SectionCard } from "@/components/SectionCard";
import { accessControlRows, roleDefinitions } from "@/modules/workspace-settings/workspace-settings.data";

type AccessRow = (typeof accessControlRows)[number];

export function RolesPermissionsPage() {
  const columns: DataTableColumn<AccessRow>[] = [
    { key: "feature", header: "Feature", cell: (row) => <span className="font-medium text-foreground">{row.feature}</span> },
    { key: "admin", header: "Admin", cell: (row) => <AccessValue value={row.admin} /> },
    { key: "agent", header: "Agent", cell: (row) => <AccessValue value={row.agent} /> },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="grid gap-4 lg:grid-cols-2">
        {roleDefinitions.map((role) => (
          <SectionCard key={role.role}>
            <h2 className="text-base font-semibold text-foreground">{role.role}</h2>
            <div className="mt-4 space-y-3">
              {role.permissions.map((permission) => (
                <div key={permission} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-whatsapp" />
                  <span>{permission}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </section>

      <SectionCard>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Access Control</h2>
          <p className="mt-1 text-sm text-muted-foreground">Simple Admin and Agent access by feature.</p>
        </div>
        <DataTable columns={columns} data={accessControlRows} getRowId={(row) => row.feature} />
      </SectionCard>
    </div>
  );
}

function AccessValue({ value }: { value: string }) {
  const Icon = value === "Allowed" ? CheckCircle2 : value === "Limited" ? MinusCircle : XCircle;
  const tone =
    value === "Allowed"
      ? "text-whatsapp-dark"
      : value === "Limited"
        ? "text-amber-700"
        : "text-error";

  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className={`h-4 w-4 ${tone}`} />
      {value}
    </span>
  );
}
