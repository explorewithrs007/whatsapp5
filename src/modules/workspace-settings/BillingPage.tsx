import { useState } from "react";
import { FileText } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { SectionCard } from "@/components/SectionCard";
import { DetailGrid, SectionHeader } from "@/components/SectionLayout";
import { StandardDialog } from "@/components/StandardDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { TableActions } from "@/components/TableActions";
import { Button } from "@/components/ui/button";
import { invoices, planDetails, type InvoiceRecord } from "@/modules/workspace-settings/workspace-settings.data";

export function BillingPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const columns: DataTableColumn<InvoiceRecord>[] = [
    { key: "invoiceNumber", header: "Invoice Number", cell: (row) => row.invoiceNumber },
    { key: "invoiceDate", header: "Invoice Date", cell: (row) => row.invoiceDate },
    { key: "amount", header: "Amount", cell: (row) => row.amount },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: "action",
      header: "Action",
      cell: (row) => (
        <TableActions actions={[{ icon: FileText, label: "View invoice", onClick: () => setSelectedInvoice(row) }]} />
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4">
      <SectionCard>
        <SectionHeader
          actions={<Button variant="outline">View Plan Details</Button>}
          description="Flat subscription plan details."
          title="Plan Management"
        />
        <DetailGrid
          columns="four"
          items={[
            { label: "Current Plan", value: planDetails.currentPlan },
            { content: <StatusBadge status={planDetails.subscriptionStatus} />, label: "Subscription Status" },
            { label: "Billing Cycle", value: planDetails.billingCycle },
            { label: "Billing Model", value: planDetails.billingModel },
            { label: "Workspace Users Limit", value: planDetails.usersLimit },
          ]}
        />
      </SectionCard>

      <SectionCard>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">Invoice Viewing</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manual subscription invoices.</p>
        </div>
        <DataTable columns={columns} data={invoices} getRowId={(row) => row.invoiceNumber} />
      </SectionCard>

      <StandardDialog
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
        open={Boolean(selectedInvoice)}
        size="sm"
        title="Invoice Details"
      >
        {selectedInvoice ? (
          <div className="grid gap-4">
            <Info label="Invoice Number" value={selectedInvoice.invoiceNumber} />
            <Info label="Invoice Date" value={selectedInvoice.invoiceDate} />
            <Info label="Amount" value={selectedInvoice.amount} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-muted">Status</p>
              <div className="mt-2"><StatusBadge status={selectedInvoice.status} /></div>
            </div>
          </div>
        ) : null}
      </StandardDialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
