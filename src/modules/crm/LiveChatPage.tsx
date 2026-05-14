import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CircleCheck, Eye, StickyNote, UserPlus } from "lucide-react";
import { BulkActionBar } from "@/components/BulkActionBar";
import { ContactIdentityBlock, DetailField, DetailTagList, InternalNoteCard } from "@/components/ContactDetails";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { EmptyState } from "@/components/EmptyState";
import { SearchInput } from "@/components/SearchInput";
import { SectionCard } from "@/components/SectionCard";
import { StandardDialog } from "@/components/StandardDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { TableActions } from "@/components/TableActions";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  agents,
  internalNotes,
  liveChatConversations,
  type InternalNote,
  type LiveChatConversation,
} from "@/modules/crm/crm.data";

const rowsPerPage = 20;
const statusOptions = ["Open", "Pending", "Closed"] as const;
const teamInboxStatusOptions = ["All Status", ...statusOptions] as const;
const selectClass =
  "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp";

type ChatStatus = (typeof statusOptions)[number];
type TeamInboxStatusFilter = (typeof teamInboxStatusOptions)[number];

function getAgentIdByName(agentName: string) {
  return agents.find((agent) => agent.name === agentName)?.id ?? agents[0].id;
}

export function LiveChatPage() {
  const [conversationRows, setConversationRows] = useState<LiveChatConversation[]>(liveChatConversations);
  const [noteRows, setNoteRows] = useState<InternalNote[]>(internalNotes);
  const [teamInboxSearch, setTeamInboxSearch] = useState("");
  const [teamInboxStatusFilter, setTeamInboxStatusFilter] = useState<TeamInboxStatusFilter>("All Status");
  const [selectedConversationIds, setSelectedConversationIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsConversation, setDetailsConversation] = useState<LiveChatConversation | null>(null);
  const [assignConversation, setAssignConversation] = useState<LiveChatConversation | null>(null);
  const [statusConversation, setStatusConversation] = useState<LiveChatConversation | null>(null);
  const [noteConversation, setNoteConversation] = useState<LiveChatConversation | null>(null);
  const [dialogAgentId, setDialogAgentId] = useState(agents[0].id);
  const [dialogStatus, setDialogStatus] = useState<ChatStatus>("Open");
  const [dialogNote, setDialogNote] = useState("");
  const [bulkDialog, setBulkDialog] = useState<"assign" | "status" | "note" | null>(null);
  const [bulkAgentId, setBulkAgentId] = useState(agents[0].id);
  const [bulkStatus, setBulkStatus] = useState<ChatStatus>("Open");
  const [bulkNote, setBulkNote] = useState("");

  const filteredConversationRows = useMemo(() => {
    const query = teamInboxSearch.trim().toLowerCase();

    return conversationRows.filter((conversation) => {
      const matchesSearch =
        !query ||
        [conversation.contact, conversation.phone, conversation.lastMessage].join(" ").toLowerCase().includes(query);
      const matchesStatus =
        teamInboxStatusFilter === "All Status" || conversation.chatStatus === teamInboxStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [conversationRows, teamInboxSearch, teamInboxStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredConversationRows.length / rowsPerPage));
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, filteredConversationRows.length);
  const visibleRows = filteredConversationRows.slice(pageStart, pageEnd);
  const selectedConversations = useMemo(
    () => conversationRows.filter((conversation) => selectedConversationIds.includes(conversation.id)),
    [conversationRows, selectedConversationIds],
  );
  const selectedConversationCount = selectedConversations.length;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const applyAssignment = (conversationId: string, agentId: string) => {
    const agent = agents.find((item) => item.id === agentId);
    const agentName = agent?.name ?? "Unassigned";

    setConversationRows((currentRows) =>
      currentRows.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, assignedAgent: agentName } : conversation,
      ),
    );
  };

  const applyStatusUpdate = (conversationId: string, status: ChatStatus) => {
    setConversationRows((currentRows) =>
      currentRows.map((row) => (row.id === conversationId ? { ...row, chatStatus: status } : row)),
    );
  };

  const addNote = (conversationId: string, note: string) => {
    const trimmedNote = note.trim();

    if (!trimmedNote) {
      return false;
    }

    setNoteRows((currentNotes) => [
      ...currentNotes,
      {
        conversationId,
        author: "Meera Shah",
        content: trimmedNote,
        timestamp: "Just now",
      },
    ]);
    return true;
  };

  const clearBulkSelection = () => {
    setSelectedConversationIds([]);
  };

  const applyBulkAssignment = () => {
    const selectedIds = new Set(selectedConversationIds);
    const agent = agents.find((item) => item.id === bulkAgentId);
    const agentName = agent?.name ?? "Unassigned";

    setConversationRows((currentRows) =>
      currentRows.map((conversation) =>
        selectedIds.has(conversation.id) ? { ...conversation, assignedAgent: agentName } : conversation,
      ),
    );
    clearBulkSelection();
    setBulkDialog(null);
  };

  const applyBulkStatusUpdate = () => {
    const selectedIds = new Set(selectedConversationIds);

    setConversationRows((currentRows) =>
      currentRows.map((conversation) =>
        selectedIds.has(conversation.id) ? { ...conversation, chatStatus: bulkStatus } : conversation,
      ),
    );
    clearBulkSelection();
    setBulkDialog(null);
  };

  const applyBulkInternalNote = () => {
    const trimmedNote = bulkNote.trim();

    if (!trimmedNote) {
      return;
    }

    setNoteRows((currentNotes) => [
      ...currentNotes,
      ...selectedConversationIds.map((conversationId) => ({
        conversationId,
        author: "Meera Shah",
        content: trimmedNote,
        timestamp: "Just now",
      })),
    ]);
    setBulkNote("");
    clearBulkSelection();
    setBulkDialog(null);
  };

  const openAssignDialog = (conversation: LiveChatConversation) => {
    setDialogAgentId(getAgentIdByName(conversation.assignedAgent));
    setAssignConversation(conversation);
  };

  const openStatusDialog = (conversation: LiveChatConversation) => {
    setDialogStatus(conversation.chatStatus as ChatStatus);
    setStatusConversation(conversation);
  };

  const openNoteDialog = (conversation: LiveChatConversation) => {
    setDialogNote("");
    setNoteConversation(conversation);
  };

  const columns: DataTableColumn<LiveChatConversation>[] = [
    {
      key: "contact",
      header: "Contact",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar compact initials={row.initials} name={row.contact} />
          <div>
            <p className="text-sm font-semibold text-foreground">{row.contact}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{row.phone}</p>
          </div>
        </div>
      ),
    },
    { key: "lastMessage", header: "Last Message", cell: (row) => row.lastMessage },
    { key: "assignedAgent", header: "Assigned Agent", cell: (row) => row.assignedAgent },
    { key: "chatStatus", header: "Chat Status", cell: (row) => <StatusBadge status={row.chatStatus} /> },
    { key: "lastActivity", header: "Last Activity", cell: (row) => row.lastActivity },
    {
      key: "action",
      header: "Action",
      cell: (row) => (
        <TableActions
          actions={[
            { icon: Eye, label: "View details", onClick: () => setDetailsConversation(row) },
            { icon: UserPlus, label: "Assign chat", onClick: () => openAssignDialog(row) },
            { icon: CircleCheck, label: "Update status", onClick: () => openStatusDialog(row) },
            { icon: StickyNote, label: "Add note", onClick: () => openNoteDialog(row), tooltipAlign: "end" },
          ]}
          maxDirectActions={4}
        />
      ),
    },
  ];

  return (
    <div className="flex w-full flex-col gap-4 pb-24">
      <SectionCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Team Inbox</h2>
            <p className="mt-1 text-sm text-muted-foreground">Team workflow for WhatsApp conversations.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <SearchInput
              onChange={(event) => {
                setTeamInboxSearch(event.target.value);
                setCurrentPage(1);
                setSelectedConversationIds([]);
              }}
              placeholder="Search conversations"
              value={teamInboxSearch}
            />
            <label className="flex w-full items-center justify-between gap-3 sm:w-auto">
              <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-normal text-muted">
                Chat Status
              </span>
              <select
                className={`${selectClass} w-40`}
                onChange={(event) => {
                  setTeamInboxStatusFilter(event.target.value as TeamInboxStatusFilter);
                  setCurrentPage(1);
                  setSelectedConversationIds([]);
                }}
                value={teamInboxStatusFilter}
              >
                {teamInboxStatusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {filteredConversationRows.length ? (
          <>
            <DataTable
              columns={columns}
              data={visibleRows}
              getRowId={(row) => row.id}
              onSelectedRowIdsChange={setSelectedConversationIds}
              selectable
              selectedRowIds={selectedConversationIds}
              showSelectionBar={false}
            />
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {pageStart + 1}-{pageEnd} of {filteredConversationRows.length} conversations
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState title="No conversations found" description="Try changing your search or status filter." />
        )}
      </SectionCard>

      <BulkActionBar
        actions={[
          { label: "Assign Agent", onClick: () => setBulkDialog("assign"), variant: "default" },
          { label: "Update Status", onClick: () => setBulkDialog("status") },
          { label: "Add Internal Note", onClick: () => setBulkDialog("note") },
        ]}
        label={`${selectedConversationCount} ${
          selectedConversationCount === 1 ? "conversation" : "conversations"
        } selected`}
        onClearSelection={clearBulkSelection}
        selectedCount={selectedConversationCount}
      />

      <ConversationDetailsDialog
        conversation={detailsConversation}
        notes={noteRows.filter((note) => note.conversationId === detailsConversation?.id)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsConversation(null);
          }
        }}
      />
      <AssignChatDialog
        agentId={dialogAgentId}
        conversation={assignConversation}
        onAgentChange={setDialogAgentId}
        onAssign={() => {
          if (assignConversation) {
            applyAssignment(assignConversation.id, dialogAgentId);
            setAssignConversation(null);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setAssignConversation(null);
          }
        }}
      />
      <UpdateStatusDialog
        conversation={statusConversation}
        onOpenChange={(open) => {
          if (!open) {
            setStatusConversation(null);
          }
        }}
        onStatusChange={setDialogStatus}
        onUpdate={() => {
          if (statusConversation) {
            applyStatusUpdate(statusConversation.id, dialogStatus);
            setStatusConversation(null);
          }
        }}
        status={dialogStatus}
      />
      <AddInternalNoteDialog
        conversation={noteConversation}
        note={dialogNote}
        onNoteChange={setDialogNote}
        onOpenChange={(open) => {
          if (!open) {
            setNoteConversation(null);
          }
        }}
        onSubmit={() => {
          if (noteConversation && addNote(noteConversation.id, dialogNote)) {
            setDialogNote("");
            setNoteConversation(null);
          }
        }}
      />
      <BulkAssignAgentDialog
        agentId={bulkAgentId}
        onAgentChange={setBulkAgentId}
        onAssign={applyBulkAssignment}
        onOpenChange={(open) => {
          if (!open) {
            setBulkDialog(null);
          }
        }}
        open={bulkDialog === "assign"}
        selectedCount={selectedConversationCount}
      />
      <BulkUpdateStatusDialog
        onOpenChange={(open) => {
          if (!open) {
            setBulkDialog(null);
          }
        }}
        onStatusChange={setBulkStatus}
        onUpdate={applyBulkStatusUpdate}
        open={bulkDialog === "status"}
        selectedCount={selectedConversationCount}
        status={bulkStatus}
      />
      <BulkInternalNoteDialog
        note={bulkNote}
        onNoteChange={setBulkNote}
        onOpenChange={(open) => {
          if (!open) {
            setBulkDialog(null);
          }
        }}
        onSubmit={applyBulkInternalNote}
        open={bulkDialog === "note"}
        selectedCount={selectedConversationCount}
      />
    </div>
  );
}

function BulkAssignAgentDialog({
  agentId,
  onAgentChange,
  onAssign,
  onOpenChange,
  open,
  selectedCount,
}: {
  agentId: string;
  onAgentChange: (agentId: string) => void;
  onAssign: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  selectedCount: number;
}) {
  return (
    <StandardDialog
      description="Assign selected conversations to an agent."
      footerRight={<Button onClick={onAssign}>Assign Agent</Button>}
      onOpenChange={onOpenChange}
      open={open}
      size="sm"
      title="Assign Agent"
    >
          <div className="grid gap-4">
            <Info label="Selected Conversations" value={`${selectedCount}`} />
            <Field label="Agent">
              <select className={selectClass} onChange={(event) => onAgentChange(event.target.value)} value={agentId}>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
    </StandardDialog>
  );
}

function BulkUpdateStatusDialog({
  onOpenChange,
  onStatusChange,
  onUpdate,
  open,
  selectedCount,
  status,
}: {
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: ChatStatus) => void;
  onUpdate: () => void;
  open: boolean;
  selectedCount: number;
  status: ChatStatus;
}) {
  return (
    <StandardDialog
      description="Update the lifecycle status for selected conversations."
      footerRight={<Button onClick={onUpdate}>Update Status</Button>}
      onOpenChange={onOpenChange}
      open={open}
      size="sm"
      title="Update Chat Status"
    >
          <div className="grid gap-4">
            <Info label="Selected Conversations" value={`${selectedCount}`} />
            <Field label="New Status">
              <select
                className={selectClass}
                onChange={(event) => onStatusChange(event.target.value as ChatStatus)}
                value={status}
              >
                {statusOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
          </div>
    </StandardDialog>
  );
}

function BulkInternalNoteDialog({
  note,
  onNoteChange,
  onOpenChange,
  onSubmit,
  open,
  selectedCount,
}: {
  note: string;
  onNoteChange: (note: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  selectedCount: number;
}) {
  return (
    <StandardDialog
      description="Add a private internal note to selected conversations. Notes are visible only to the team and are not sent to customers."
      footerRight={<Button disabled={!note.trim()} onClick={onSubmit}>Add Internal Note</Button>}
      onOpenChange={onOpenChange}
      open={open}
      size="sm"
      title="Add Internal Note"
    >
          <div className="grid gap-4">
            <Info label="Selected Conversations" value={`${selectedCount}`} />
            <Field label="Note">
              <textarea
                className="min-h-24 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp"
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="Add a private internal note for selected conversations"
                value={note}
              />
            </Field>
          </div>
    </StandardDialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</span>
      {children}
    </label>
  );
}

function NoteCard({ note }: { note: InternalNote }) {
  return <InternalNoteCard author={note.author} content={note.content} timestamp={note.timestamp} />;
}

function ConversationDetailsDialog({
  conversation,
  notes,
  onOpenChange,
}: {
  conversation: LiveChatConversation | null;
  notes: InternalNote[];
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <StandardDialog
      onOpenChange={onOpenChange}
      open={Boolean(conversation)}
      title="Conversation Details"
    >
          {conversation ? (
            <div className="space-y-5">
              <ContactIdentityBlock
                avatarUrl={conversation.avatarUrl}
                initials={conversation.initials}
                name={conversation.contact}
                phone={conversation.phone}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField label="Contact Name" value={conversation.contact} />
                <DetailField label="Phone Number" value={conversation.phone} />
                <DetailField label="Email" value={conversation.email} />
                <DetailField label="Last Message" value={conversation.lastMessage} />
                <DetailField label="Assigned Agent" value={conversation.assignedAgent} />
                <DetailField label="Last Activity" value={conversation.lastActivity} />
                <DetailField label="Conversation Status">
                  <div className="mt-2">
                    <StatusBadge status={conversation.chatStatus} />
                  </div>
                </DetailField>
                <DetailField label="Tags">
                  <DetailTagList tags={conversation.tags} />
                </DetailField>
              </div>
              <DetailField label="Conversation History" value={conversation.historySummary} />
              <div>
                <DetailField label="Internal Notes">
                  <></>
                </DetailField>
                <div className="mt-4 space-y-3">
                  {notes.length ? (
                    notes.map((note) => <NoteCard key={`${note.author}-${note.timestamp}-${note.content}`} note={note} />)
                  ) : (
                    <p className="rounded-xl border border-border bg-slate-50 p-4 text-sm text-muted-foreground">No internal notes yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
    </StandardDialog>
  );
}

function AssignChatDialog({
  agentId,
  conversation,
  onAgentChange,
  onAssign,
  onOpenChange,
}: {
  agentId: string;
  conversation: LiveChatConversation | null;
  onAgentChange: (agentId: string) => void;
  onAssign: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <StandardDialog
      description="Assign this WhatsApp conversation to an agent."
      footerRight={<Button onClick={onAssign}>Assign Chat</Button>}
      onOpenChange={onOpenChange}
      open={Boolean(conversation)}
      size="sm"
      title="Assign Chat"
    >
          {conversation ? (
            <div className="grid gap-4">
              <Info label="Conversation" value={conversation.contact} />
              <Field label="Assign to Agent">
                <select className={selectClass} onChange={(event) => onAgentChange(event.target.value)} value={agentId}>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}
    </StandardDialog>
  );
}

function UpdateStatusDialog({
  conversation,
  onOpenChange,
  onStatusChange,
  onUpdate,
  status,
}: {
  conversation: LiveChatConversation | null;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (status: ChatStatus) => void;
  onUpdate: () => void;
  status: ChatStatus;
}) {
  return (
    <StandardDialog
      description="Update the lifecycle status for this conversation."
      footerRight={<Button onClick={onUpdate}>Update Status</Button>}
      onOpenChange={onOpenChange}
      open={Boolean(conversation)}
      size="sm"
      title="Update Chat Status"
    >
          {conversation ? (
            <div className="grid gap-4">
              <Info label="Conversation" value={conversation.contact} />
              <Field label="New Status">
                <select
                  className={selectClass}
                  onChange={(event) => onStatusChange(event.target.value as ChatStatus)}
                  value={status}
                >
                  {statusOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}
    </StandardDialog>
  );
}

function AddInternalNoteDialog({
  conversation,
  note,
  onNoteChange,
  onOpenChange,
  onSubmit,
}: {
  conversation: LiveChatConversation | null;
  note: string;
  onNoteChange: (note: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <StandardDialog
      description="Internal notes are visible only to the team and are not sent to the customer."
      onOpenChange={onOpenChange}
      open={Boolean(conversation)}
      size="sm"
      title="Add Internal Note"
      footerRight={<Button disabled={!note.trim()} onClick={onSubmit}>Add Internal Note</Button>}
    >
          {conversation ? (
            <div className="grid gap-4">
              <Info label="Conversation" value={conversation.contact} />
              <Field label="Note">
                <textarea
                  className="min-h-24 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp"
                  onChange={(event) => onNoteChange(event.target.value)}
                  placeholder="Add a private internal note for this conversation"
                  value={note}
                />
              </Field>
            </div>
          ) : null}
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
