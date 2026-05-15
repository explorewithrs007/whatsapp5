import { useEffect, useRef, useState } from "react";
import {
  BotMessageSquare,
  CheckCircle2,
  Copy,
  Eye,
  FileText,
  Image,
  MessageSquareText,
  Pencil,
  RefreshCcw,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import { BulkActionBar } from "@/components/BulkActionBar";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PageTabs } from "@/components/PageTabs";
import { SectionCard } from "@/components/SectionCard";
import { DetailGrid, SectionHeader } from "@/components/SectionLayout";
import { StandardDialog } from "@/components/StandardDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { TableActions } from "@/components/TableActions";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  getTemplateVariableDefinition,
  getTemplateVariableSample,
  resolveTemplateVariables,
  supportedTemplateVariables,
  type TemplateVariableContext,
  type TemplateVariableGroup,
} from "@/lib/templateVariables";
import {
  messageStatusOverview,
  supportedMessageTypes,
  templates,
  whatsappConnection,
  type TemplateMessage,
} from "@/modules/channels/channels.data";
import { crmTriggers, type CRMTriggerRecord } from "@/modules/crm/crm.data";

const triggerColumns: DataTableColumn<CRMTriggerRecord>[] = [
  {
    key: "triggerName",
    header: "Trigger Name",
    cell: (row) => <span className="font-medium text-foreground">{row.triggerName}</span>,
  },
  {
    key: "keyword",
    header: "Keyword",
    cell: (row) => <span className="font-medium text-whatsapp-dark">{row.keyword}</span>,
  },
  {
    key: "response",
    header: "Response Preview",
    cell: (row) => row.response,
  },
  {
    key: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "lastUpdated",
    header: "Last Updated",
    cell: (row) => row.lastUpdated,
  },
];

function ApiConnectionSection() {
  return (
    <SectionCard>
      <SectionHeader
        actions={
          <>
          <Button>Connect WhatsApp</Button>
          <Button variant="outline">Reconnect</Button>
          <Button variant="outline">Test Connection</Button>
          </>
        }
        description="BSP-managed WhatsApp setup."
        title="API Connection"
      />
      <DetailGrid
        items={[
          { label: "Connection Status", value: whatsappConnection.status },
          { label: "WhatsApp Business Account", value: whatsappConnection.businessAccount },
          { label: "Business Phone Number", value: whatsappConnection.businessPhoneNumber },
          { label: "Phone Number ID", value: whatsappConnection.phoneNumberId },
          { label: "Connection Model", value: whatsappConnection.setupType },
          { label: "Last Webhook Received", value: whatsappConnection.lastWebhookReceived },
        ]}
      />
    </SectionCard>
  );
}

function SendReceiveSection() {
  const icons = [MessageSquareText, Image, FileText, BotMessageSquare];

  return (
    <SectionCard>
      <SectionHeader description="Supported WhatsApp message types." title="Send/Receive Messages" />
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {supportedMessageTypes.map((type, index) => {
          const Icon = icons[index];

          return (
            <div key={type.label} className="min-w-0 rounded-xl bg-slate-50/70 px-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-whatsapp/20 bg-whatsapp-light text-whatsapp-dark">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{type.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function TemplateMessagesSection() {
  const [templateRows, setTemplateRows] = useState<TemplateMessage[]>(templates);
  const [formOpen, setFormOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateMessage | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<TemplateMessage | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [rejectTemplate, setRejectTemplate] = useState<TemplateMessage | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TemplateMessage | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState("");
  const selectedTemplates = templateRows.filter((template) => selectedTemplateIds.includes(template.templateId));
  const selectedTemplateCount = selectedTemplates.length;
  const selectedApprovalEligibleCount = selectedTemplates.filter(
    (template) => template.status === "Draft" || template.status === "Rejected",
  ).length;
  const selectedTemplateLabel = `${selectedTemplateCount} ${
    selectedTemplateCount === 1 ? "template" : "templates"
  } selected${
    selectedApprovalEligibleCount && selectedApprovalEligibleCount < selectedTemplateCount
      ? ` · ${selectedApprovalEligibleCount} eligible for approval`
      : ""
  }`;

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormOpen(true);
  };

  const openEditDialog = (template: TemplateMessage) => {
    setEditingTemplate(template);
    setFormOpen(true);
  };

  const submitForApproval = (template: TemplateMessage) => {
    setTemplateRows((currentRows) =>
      currentRows.map((row) =>
        row.templateId === template.templateId
          ? { ...row, status: "Submitted", lastUpdated: "Today", rejectionReason: undefined }
          : row,
      ),
    );
  };

  const approveTemplate = (template: TemplateMessage) => {
    setTemplateRows((currentRows) =>
      currentRows.map((row) =>
        row.templateId === template.templateId ? { ...row, status: "Approved", lastUpdated: "Today" } : row,
      ),
    );
  };

  const duplicateTemplate = (template: TemplateMessage) => {
    setTemplateRows((currentRows) => [
      ...currentRows,
      {
        ...template,
        displayName: `${template.displayName} Copy`,
        templateId: `${template.templateId}_copy`,
        status: "Draft",
        lastUpdated: "Today",
        rejectionReason: undefined,
      },
    ]);
  };

  const confirmRejectTemplate = () => {
    if (!rejectTemplate) {
      return;
    }

    setTemplateRows((currentRows) =>
      currentRows.map((row) =>
        row.templateId === rejectTemplate.templateId
          ? {
              ...row,
              status: "Rejected",
              lastUpdated: "Today",
              rejectionReason: rejectionReason || "No rejection reason provided.",
            }
          : row,
      ),
    );
    setRejectTemplate(null);
    setRejectionReason("");
  };

  const clearTemplateSelection = () => {
    setSelectedTemplateIds([]);
    setBulkMessage("");
  };

  const submitSelectedForApproval = () => {
    const eligibleIds = new Set(
      selectedTemplates
        .filter((template) => template.status === "Draft" || template.status === "Rejected")
        .map((template) => template.templateId),
    );

    if (!eligibleIds.size) {
      setBulkMessage("Only Draft or Rejected templates can be submitted for approval.");
      return;
    }

    setTemplateRows((currentRows) =>
      currentRows.map((template) =>
        eligibleIds.has(template.templateId)
          ? { ...template, status: "Submitted", lastUpdated: "Today", rejectionReason: undefined }
          : template,
      ),
    );
    clearTemplateSelection();
  };

  const templateColumns: DataTableColumn<TemplateMessage>[] = [
    {
      key: "template",
      header: "Template",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.displayName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{row.templateId}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => row.category,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "lastUpdated",
      header: "Last Updated",
      cell: (row) => row.lastUpdated,
    },
    {
      key: "action",
      header: "Action",
      cell: (row) => (
        <TableActions
          actions={[
            { icon: Eye, label: "Preview template", onClick: () => setPreviewTemplate(row) },
            ...(row.status === "Draft" || row.status === "Rejected"
              ? [{ icon: Pencil, label: "Edit template", onClick: () => openEditDialog(row) }]
              : []),
            { icon: Copy, label: "Duplicate template", onClick: () => duplicateTemplate(row) },
            ...(row.status === "Draft" || row.status === "Rejected"
              ? [
                  {
                    icon: RefreshCcw,
                    label: "Submit for approval",
                    onClick: () => submitForApproval(row),
                    showInOverflow: true,
                  },
                ]
              : []),
            ...(row.status === "Submitted"
              ? [
                  { icon: CheckCircle2, label: "Approve template", onClick: () => approveTemplate(row), showInOverflow: true },
                  {
                    icon: XCircle,
                    label: "Reject template",
                    onClick: () => {
                      setRejectTemplate(row);
                      setRejectionReason("");
                    },
                    showInOverflow: true,
                  },
                ]
              : []),
            { icon: Trash2, label: "Delete template", onClick: () => setDeleteTemplate(row), destructive: true },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="grid gap-4 pb-24">
      <SectionCard>
        <SectionHeader
          actions={<Button onClick={openCreateDialog}>Create Template</Button>}
          description="Manage pre-approved WhatsApp templates."
          title="Template Messages"
        />
        {bulkMessage ? <p className="mb-3 text-sm font-medium text-amber-700">{bulkMessage}</p> : null}
        <DataTable
          columns={templateColumns}
          data={templateRows}
          getRowId={(row) => row.templateId}
          onSelectedRowIdsChange={(selectedIds) => {
            setSelectedTemplateIds(selectedIds);
            setBulkMessage("");
          }}
          selectable
          selectedRowIds={selectedTemplateIds}
          showSelectionBar={false}
        />
        <p className="mt-3 text-xs text-muted-foreground">Only approved templates can be used in WhatsApp Inbox.</p>
      </SectionCard>

      <BulkActionBar
        actions={[
          ...(selectedApprovalEligibleCount
            ? [{ label: "Submit for Approval", onClick: submitSelectedForApproval, variant: "default" as const }]
            : []),
          { label: "Delete", onClick: () => setDeleteSelectedOpen(true) },
        ]}
        label={selectedTemplateLabel}
        onClearSelection={clearTemplateSelection}
        selectedCount={selectedTemplateCount}
      />

      <TemplateFormDialog
        editingTemplate={editingTemplate}
        open={formOpen}
        onOpenChange={setFormOpen}
        onPreview={(template) => setPreviewTemplate(template)}
        onSave={(template) => {
          setTemplateRows((currentRows) => {
            const targetTemplateId = editingTemplate?.templateId ?? template.templateId;
            const exists = currentRows.some((row) => row.templateId === targetTemplateId);

            if (exists) {
              return currentRows.map((row) => (row.templateId === targetTemplateId ? template : row));
            }

            return [...currentRows, template];
          });
          setFormOpen(false);
        }}
      />

      <TemplatePreviewDialog
        template={previewTemplate}
        onEdit={(template) => {
          setPreviewTemplate(null);
          openEditDialog(template);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTemplate(null);
          }
        }}
      />

      <RejectionDialog
        open={Boolean(rejectTemplate)}
        reason={rejectionReason}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTemplate(null);
            setRejectionReason("");
          }
        }}
        onReasonChange={setRejectionReason}
        onReject={confirmRejectTemplate}
      />

      <ConfirmationDialog
        cancelLabel="Cancel"
        confirmLabel="Delete"
        description="Are you sure you want to delete this template? This action is only for the frontend prototype."
        onConfirm={() => {
          if (deleteTemplate) {
            setTemplateRows((currentRows) =>
              currentRows.filter((template) => template.templateId !== deleteTemplate.templateId),
            );
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTemplate(null);
          }
        }}
        open={Boolean(deleteTemplate)}
        title="Delete Template"
      />

      <ConfirmationDialog
        cancelLabel="Cancel"
        confirmLabel="Delete"
        description="Are you sure you want to delete the selected templates? This action is only for the frontend prototype."
        onConfirm={() => {
          const selectedIds = new Set(selectedTemplateIds);
          setTemplateRows((currentRows) =>
            currentRows.filter((template) => !selectedIds.has(template.templateId)),
          );
          clearTemplateSelection();
        }}
        onOpenChange={setDeleteSelectedOpen}
        open={deleteSelectedOpen}
        title="Delete Selected Templates"
      />
    </div>
  );
}

const templateCategories: TemplateMessage["category"][] = ["Utility", "Marketing", "Authentication"];
const variableGroups: TemplateVariableGroup[] = ["Contact", "Conversation", "Custom Attributes", "System", "Business"];
const templateSampleContext: TemplateVariableContext = {
  assignedAgent: "Meera Shah",
  businessName: "Pixelotech Support",
  contactName: "Priya Kapoor",
  conversationStatus: "Open",
  customAttributes: {
    "Appointment Date": "May 14, 2026",
    Budget: "50000",
    City: "Mumbai",
    "Customer Type": "Existing Customer",
    "Lead Stage": "Qualified",
    "Order ID": "ORD-1042",
    Requirement: "Appointment confirmation",
  },
  email: "priya.kapoor@example.com",
  phoneNumber: "+91 98765 43210",
};

function detectTemplateVariables(messageBody: string) {
  const variables = new Set<string>();
  const matcher = /{{\s*([A-Za-z0-9_]+)\s*}}/g;
  let match = matcher.exec(messageBody);

  while (match) {
    variables.add(match[1].trim());
    match = matcher.exec(messageBody);
  }

  return [...variables];
}

function parseLegacyVariablesPreview(variablesPreview?: string) {
  if (!variablesPreview) {
    return {};
  }

  return variablesPreview.split(",").reduce<Record<string, string>>((samples, pair) => {
    const [rawName, ...rawValue] = pair.split("=");
    const name = rawName?.trim();
    const value = rawValue.join("=").trim();

    if (name && value) {
      samples[name] = value;
    }

    return samples;
  }, {});
}

function getTemplateVariableSamples(template: TemplateMessage) {
  return template.variableSamples ?? parseLegacyVariablesPreview(template.variablesPreview);
}

function buildVariablesPreview(template: TemplateMessage) {
  const samples = getTemplateVariableSamples(template);
  const variables = detectTemplateVariables(template.messageBody);

  if (!variables.length) {
    return "No variables";
  }

  return variables.map((variable) => `${variable} = ${samples[variable] || `[${variable}]`}`).join(", ");
}

function buildPreview(template: Pick<TemplateMessage, "messageBody" | "variableSamples" | "variablesPreview">) {
  return resolveTemplateVariables(template.messageBody, {
    ...templateSampleContext,
    variableSamples: template.variableSamples ?? parseLegacyVariablesPreview(template.variablesPreview),
  });
}

function createDraftTemplate(template?: TemplateMessage): TemplateMessage {
  const draft: TemplateMessage = {
    displayName: template?.displayName ?? "Appointment Confirmation",
    templateId: template?.templateId ?? "appointment_confirmation",
    category: template?.category ?? "Utility",
    language: template?.language ?? "English",
    status: template?.status ?? "Draft",
    lastUpdated: template?.lastUpdated ?? "Today",
    messageBody: template?.messageBody ?? "Hi {{name}}, your appointment is confirmed for {{date}}.",
    variableSamples:
      template?.variableSamples ?? parseLegacyVariablesPreview(template?.variablesPreview ?? "name = Priya Kapoor, date = May 14, 2026"),
    variablesPreview: template?.variablesPreview ?? "name = Priya Kapoor, date = May 14, 2026",
    rejectionReason: template?.rejectionReason,
  };

  return {
    ...draft,
    variablesPreview: buildVariablesPreview(draft),
  };
}

function TemplateFormDialog({
  editingTemplate,
  open,
  onOpenChange,
  onPreview,
  onSave,
}: {
  editingTemplate: TemplateMessage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPreview: (template: TemplateMessage) => void;
  onSave: (template: TemplateMessage) => void;
}) {
  const [formTemplate, setFormTemplate] = useState<TemplateMessage>(createDraftTemplate(editingTemplate ?? undefined));
  const messageBodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setFormTemplate(createDraftTemplate(editingTemplate ?? undefined));
    }
  }, [editingTemplate, open]);

  const resetForm = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const updateForm = (updates: Partial<TemplateMessage>) => {
    setFormTemplate((currentTemplate) => ({ ...currentTemplate, ...updates }));
  };

  const detectedVariables = detectTemplateVariables(formTemplate.messageBody);
  const getCurrentVariableSamples = () => getTemplateVariableSamples(formTemplate);
  const getVariableSampleValue = (variable: string) =>
    getCurrentVariableSamples()[variable] ??
    getTemplateVariableSample(variable, {
      ...templateSampleContext,
      variableSamples: getCurrentVariableSamples(),
    }) ??
    "";
  const buildFormTemplateWithSamples = () => {
    const variableSamples = detectedVariables.reduce<Record<string, string>>((samples, variable) => {
      samples[variable] = getVariableSampleValue(variable);
      return samples;
    }, {});

    return {
      ...formTemplate,
      variableSamples,
      variablesPreview: buildVariablesPreview({ ...formTemplate, variableSamples }),
    };
  };

  const insertVariable = (token: string) => {
    const textarea = messageBodyRef.current;
    let nextCursorPosition = formTemplate.messageBody.length + token.length;

    setFormTemplate((currentTemplate) => {
      const start = textarea?.selectionStart ?? currentTemplate.messageBody.length;
      const end = textarea?.selectionEnd ?? currentTemplate.messageBody.length;
      const nextBody = `${currentTemplate.messageBody.slice(0, start)}${token}${currentTemplate.messageBody.slice(end)}`;
      nextCursorPosition = start + token.length;

      return { ...currentTemplate, messageBody: nextBody };
    });

    window.setTimeout(() => {
      textarea?.focus();
      textarea?.setSelectionRange(nextCursorPosition, nextCursorPosition);
    }, 0);
  };

  const updateVariableSample = (variable: string, value: string) => {
    setFormTemplate((currentTemplate) => {
      const nextTemplate = {
        ...currentTemplate,
        variableSamples: {
          ...getTemplateVariableSamples(currentTemplate),
          [variable]: value,
        },
      };

      return {
        ...nextTemplate,
        variablesPreview: buildVariablesPreview(nextTemplate),
      };
    });
  };

  const saveTemplate = (status: "Draft" | "Submitted") => {
    const sampledTemplate = buildFormTemplateWithSamples();
    const nextTemplate = {
      ...sampledTemplate,
      status,
      lastUpdated: "Today",
      variablesPreview: buildVariablesPreview(sampledTemplate),
      rejectionReason: undefined,
    };

    onSave(nextTemplate);
  };

  return (
    <StandardDialog
      description={editingTemplate ? "Update this WhatsApp message template." : "Create a WhatsApp message template for approval."}
      footerLeft={
        <Button
          variant="outline"
          onClick={() => onPreview(buildFormTemplateWithSamples())}
        >
          Preview
        </Button>
      }
      footerRight={
        <>
          <Button variant="outline" onClick={() => saveTemplate("Draft")}>{editingTemplate ? "Save Changes" : "Save Draft"}</Button>
          <Button onClick={() => saveTemplate("Submitted")}>Submit for Approval</Button>
        </>
      }
      onOpenChange={resetForm}
      open={open}
      size="lg"
      title={editingTemplate ? "Edit Template" : "Create Template"}
    >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">Template Display Name</label>
              <Input
                className="mt-2"
                onChange={(event) => updateForm({ displayName: event.target.value })}
                value={formTemplate.displayName}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Template ID</label>
              <Input
                className="mt-2"
                onChange={(event) => updateForm({ templateId: event.target.value })}
                value={formTemplate.templateId}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                className="mt-2 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp"
                onChange={(event) => updateForm({ category: event.target.value as TemplateMessage["category"] })}
                value={formTemplate.category}
              >
                {templateCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Language</label>
              <Input
                className="mt-2"
                onChange={(event) => updateForm({ language: event.target.value })}
                value={formTemplate.language}
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-sm font-medium text-foreground" htmlFor="template-message-body">
                  Message Body
                </label>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <Button size="sm" type="button" variant="outline">
                      Insert Variable
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      align="end"
                      className="z-50 max-h-80 w-80 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-soft"
                    >
                      {variableGroups.map((group) => (
                        <DropdownMenu.Group key={group}>
                          <DropdownMenu.Label className="px-3 py-2 text-xs font-semibold uppercase tracking-normal text-muted">
                            {group}
                          </DropdownMenu.Label>
                          {supportedTemplateVariables
                            .filter((variable) => variable.group === group)
                            .map((variable) => (
                              <DropdownMenu.Item
                                key={variable.key}
                                className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-slate-50"
                                onSelect={() => insertVariable(variable.token)}
                              >
                                <span className="block text-sm font-medium text-foreground">{variable.label}</span>
                                <span className="block text-xs text-muted-foreground">{variable.token}</span>
                              </DropdownMenu.Item>
                            ))}
                        </DropdownMenu.Group>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
              <textarea
                id="template-message-body"
                ref={messageBodyRef}
                className="mt-2 min-h-28 w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp"
                onChange={(event) => updateForm({ messageBody: event.target.value })}
                value={formTemplate.messageBody}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Use variables to personalize templates. Insert a variable or type it using {"{{variable_name}}"}.
              </p>
            </div>
            <div className="sm:col-span-2">
              <div className="rounded-xl bg-slate-50/70 p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Variables</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Sample values are used only for preview.</p>
                  </div>
                </div>
                {detectedVariables.length ? (
                  <div className="mt-4 grid gap-3">
                    <div className="hidden grid-cols-[minmax(0,1fr)_140px_minmax(0,1.4fr)] gap-3 text-xs font-semibold uppercase tracking-normal text-muted sm:grid">
                      <span>Variable</span>
                      <span>Source</span>
                      <span>Sample Value</span>
                    </div>
                    {detectedVariables.map((variable) => {
                      const definition = getTemplateVariableDefinition(variable);

                      return (
                        <div key={variable} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,1.4fr)] sm:items-center">
                          <span className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground">
                            {variable}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">{definition?.group ?? "Custom"}</span>
                          <Input
                            onChange={(event) => updateVariableSample(variable, event.target.value)}
                            placeholder={`Sample for ${variable}`}
                            value={getVariableSampleValue(variable)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg border border-dashed border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                    No variables detected. Add variables using {"{{variable_name}}"} in the message body.
                  </p>
                )}
              </div>
            </div>
          </div>

    </StandardDialog>
  );
}

function TemplatePreviewDialog({
  template,
  onEdit,
  onOpenChange,
}: {
  template: TemplateMessage | null;
  onEdit: (template: TemplateMessage) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <StandardDialog
      footerRight={
        template?.status === "Draft" || template?.status === "Rejected" ? (
          <Button onClick={() => onEdit(template)}>Edit Template</Button>
        ) : null
      }
      onOpenChange={onOpenChange}
      open={Boolean(template)}
      title="Template Preview"
    >
          {template ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Template Display Name" value={template.displayName} />
                <Info label="Template ID" value={template.templateId} />
                <Info label="Category" value={template.category} />
                <Info label="Language" value={template.language} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-normal text-muted">Status</p>
                  <div className="mt-2">
                    <StatusBadge status={template.status} />
                  </div>
                </div>
              </div>
              <Info label="Message Body" value={template.messageBody} />
              <Info label="Variables" value={buildVariablesPreview(template)} />
              <div className="rounded-xl bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-normal text-muted">Final Preview</p>
                <p className="mt-2 text-sm text-foreground">{buildPreview(template)}</p>
              </div>
              {template.rejectionReason ? <Info label="Rejection Reason" value={template.rejectionReason} /> : null}
            </div>
          ) : null}
    </StandardDialog>
  );
}

function RejectionDialog({
  open,
  reason,
  onOpenChange,
  onReasonChange,
  onReject,
}: {
  open: boolean;
  reason: string;
  onOpenChange: (open: boolean) => void;
  onReasonChange: (reason: string) => void;
  onReject: () => void;
}) {
  return (
    <StandardDialog
      description="Add a frontend-only rejection reason for this prototype."
      footerRight={<Button onClick={onReject} variant="destructive">Reject Template</Button>}
      onOpenChange={onOpenChange}
      open={open}
      size="sm"
      title="Reject Template"
    >
          <div>
            <label className="text-sm font-medium text-foreground">Rejection Reason</label>
            <textarea
              className="mt-2 min-h-24 w-full resize-none rounded-xl border border-border bg-card p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp"
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Explain why this template was rejected"
              value={reason}
            />
          </div>
    </StandardDialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

function ChatbotTriggersSection({ onManageCRMTriggers }: { onManageCRMTriggers: () => void }) {
  return (
    <SectionCard>
      <SectionHeader
        actions={
          <Button onClick={onManageCRMTriggers} type="button" variant="outline">
            Manage in CRM Triggers
          </Button>
        }
        description="Keyword-based WhatsApp auto-responses."
        title="Chatbot Triggers"
      />
      <DataTable columns={triggerColumns} data={crmTriggers} getRowId={(row) => row.keyword} />
    </SectionCard>
  );
}

function MessageStatusSection() {
  const icons = [Send, CheckCircle2, CheckCircle2];

  return (
    <SectionCard>
      <SectionHeader description="Track sent, delivered, and read status." title="Message Status" />
      <div className="grid gap-2 md:grid-cols-3">
        {messageStatusOverview.map((item, index) => {
          const Icon = icons[index];

          return (
            <div key={item.status} className="min-w-0 rounded-xl bg-slate-50/70 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <StatusBadge status={item.status} />
                  <p className="mt-2 text-2xl font-semibold leading-none tracking-normal text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-whatsapp-light text-whatsapp-dark">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        These totals relate to WhatsApp Message Volume shown on the Dashboard.
      </p>
    </SectionCard>
  );
}

type WhatsAppPageProps = {
  activeTab?: string;
  onManageCRMTriggers?: () => void;
  onTabChange?: (value: string) => void;
};

export function WhatsAppPage({
  activeTab = "api-connection",
  onManageCRMTriggers = () => undefined,
  onTabChange,
}: WhatsAppPageProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageTabs
        defaultValue="api-connection"
        onValueChange={onTabChange}
        value={activeTab}
        tabs={[
          {
            value: "api-connection",
            label: "API Connection",
            content: <ApiConnectionSection />,
          },
          {
            value: "send-receive-messages",
            label: "Send/Receive Messages",
            content: <SendReceiveSection />,
          },
          {
            value: "template-messages",
            label: "Template Messages",
            content: <TemplateMessagesSection />,
          },
          {
            value: "chatbot-triggers",
            label: "Chatbot Triggers",
            content: <ChatbotTriggersSection onManageCRMTriggers={onManageCRMTriggers} />,
          },
          {
            value: "message-status",
            label: "Message Status",
            content: <MessageStatusSection />,
          },
        ]}
      />
    </div>
  );
}
