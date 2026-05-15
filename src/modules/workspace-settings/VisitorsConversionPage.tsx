import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CircleCheck, Eye, UserCheck, UserPlus, UsersRound } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { MetricCard } from "@/components/MetricCard";
import { SectionCard } from "@/components/SectionCard";
import { StandardDialog } from "@/components/StandardDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { TableActions } from "@/components/TableActions";
import { Button } from "@/components/ui/button";
import { leads, type LeadRecord } from "@/modules/workspace-settings/workspace-settings.data";

const leadStatusOptions = ["New Lead", "Contacted", "Qualified", "Customer", "Lost"] as const;
const selectClass =
  "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp";
const summaryIcons = [UserPlus, UserCheck, CircleCheck, UsersRound] as const;

export function VisitorsConversionPage() {
  const [leadRows, setLeadRows] = useState<LeadRecord[]>(leads);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [statusLead, setStatusLead] = useState<LeadRecord | null>(null);
  const [leadStatus, setLeadStatus] = useState<LeadRecord["leadStatus"]>("Contacted");

  const summary = useMemo(
    () => [
      { title: "New Leads", value: `${leadRows.filter((lead) => lead.leadStatus === "New Lead").length}` },
      { title: "Contacted", value: `${leadRows.filter((lead) => lead.leadStatus === "Contacted").length}` },
      { title: "Qualified", value: `${leadRows.filter((lead) => lead.leadStatus === "Qualified").length}` },
      { title: "Customers", value: `${leadRows.filter((lead) => lead.leadStatus === "Customer").length}` },
    ],
    [leadRows],
  );

  const columns: DataTableColumn<LeadRecord>[] = [
    { key: "lead", header: "Lead / Contact", cell: (row) => <div><p className="font-medium text-foreground">{row.contact}</p><p className="text-xs text-muted-foreground">{row.phone}</p></div> },
    { key: "source", header: "Source", cell: (row) => row.source },
    { key: "firstMessage", header: "First Message", cell: (row) => row.firstMessage },
    { key: "assignedAgent", header: "Assigned Agent", cell: (row) => row.assignedAgent },
    { key: "leadStatus", header: "Lead Status", cell: (row) => <StatusBadge status={row.leadStatus} /> },
    { key: "createdAt", header: "Created At", cell: (row) => row.createdAt },
    {
      key: "action",
      header: "Action",
      cell: (row) => (
        <TableActions
          actions={[
            { icon: Eye, label: "View lead", onClick: () => setSelectedLead(row) },
            {
              icon: CircleCheck,
              label: "Update lead status",
              onClick: () => {
                setLeadStatus(row.leadStatus);
                setStatusLead(row);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <SectionCard>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Conversion Tracking</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track lead conversion status.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.map((item, index) => {
            const Icon = summaryIcons[index] ?? UserPlus;
            return <MetricCard key={item.title} icon={Icon} title={item.title} value={item.value} />;
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Lead Tracking</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review incoming WhatsApp leads.</p>
        </div>
        <DataTable columns={columns} data={leadRows} getRowId={(row) => row.id} />
      </SectionCard>

      <StandardDialog
        onOpenChange={(open) => !open && setSelectedLead(null)}
        open={Boolean(selectedLead)}
        size="sm"
        title="Lead Details"
      >
        {selectedLead ? <LeadDetails lead={selectedLead} /> : null}
      </StandardDialog>

      <StandardDialog
        description="Update this WhatsApp lead status locally."
        footerRight={(
          <Button onClick={() => {
            if (statusLead) {
              setLeadRows((current) => current.map((lead) => lead.id === statusLead.id ? { ...lead, leadStatus } : lead));
              setStatusLead(null);
            }
          }}>Update Lead Status</Button>
        )}
        onOpenChange={(open) => !open && setStatusLead(null)}
        open={Boolean(statusLead)}
        size="sm"
        title="Update Lead Status"
      >
        {statusLead ? (
          <div className="grid gap-4">
            <Info label="Lead" value={statusLead.contact} />
            <Field label="New Status">
              <select className={selectClass} value={leadStatus} onChange={(event) => setLeadStatus(event.target.value as LeadRecord["leadStatus"])}>
                {leadStatusOptions.map((status) => <option key={status}>{status}</option>)}
              </select>
            </Field>
          </div>
        ) : null}
      </StandardDialog>
    </div>
  );
}

function LeadDetails({ lead }: { lead: LeadRecord }) {
  return <div className="grid gap-4"><Info label="Contact" value={lead.contact} /><Info label="Source" value={lead.source} /><Info label="First Message" value={lead.firstMessage} /><Info label="Assigned Agent" value={lead.assignedAgent} /></div>;
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</span>{children}</label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</p><p className="mt-1 text-sm text-foreground">{value}</p></div>;
}
