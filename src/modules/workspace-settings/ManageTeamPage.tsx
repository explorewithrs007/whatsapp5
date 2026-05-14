import { useState } from "react";
import type { ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { SectionCard } from "@/components/SectionCard";
import { StandardDialog } from "@/components/StandardDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { TableActions } from "@/components/TableActions";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { teamMembers, type TeamMemberRecord } from "@/modules/workspace-settings/workspace-settings.data";

const selectClass =
  "h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp";

export function ManageTeamPage() {
  const [members, setMembers] = useState<TeamMemberRecord[]>(teamMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberRecord | null>(null);
  const [removingMember, setRemovingMember] = useState<TeamMemberRecord | null>(null);
  const [invite, setInvite] = useState({ name: "", email: "", role: "Agent" as TeamMemberRecord["role"] });
  const [role, setRole] = useState<TeamMemberRecord["role"]>("Agent");

  const columns: DataTableColumn<TeamMemberRecord>[] = [
    {
      key: "user",
      header: "User",
      cell: (row) => <UserAvatar initials={row.initials} name={row.name} role={row.role} />,
    },
    { key: "email", header: "Email", cell: (row) => row.email },
    { key: "role", header: "Role", cell: (row) => row.role },
    { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { key: "workload", header: "Workload / Active Chats", cell: (row) => row.workload },
    {
      key: "action",
      header: "Action",
      cell: (row) => (
        <TableActions
          actions={[
            {
              icon: Pencil,
              label: "Edit role",
              onClick: () => {
                setRole(row.role);
                setEditingMember(row);
              },
            },
            { icon: Trash2, label: "Remove user", onClick: () => setRemovingMember(row) },
          ]}
        />
      ),
    },
  ];

  const sendInvite = () => {
    const initials = invite.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "IU";
    setMembers((current) => [
      ...current,
      {
        id: `invite-${Date.now()}`,
        name: invite.name || "Invited User",
        email: invite.email || "invited.user@example.com",
        initials,
        role: invite.role,
        status: "Invited",
        workload: "0 active chats",
      },
    ]);
    setInvite({ name: "", email: "", role: "Agent" });
    setInviteOpen(false);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <SectionCard>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Team Members</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage users, roles, and status.</p>
          </div>
          <Button onClick={() => setInviteOpen(true)}>Invite User</Button>
        </div>
        <DataTable columns={columns} data={members} getRowId={(row) => row.id} />
      </SectionCard>

      <InviteUserDialog invite={invite} onInviteChange={setInvite} onOpenChange={setInviteOpen} onSubmit={sendInvite} open={inviteOpen} />
      <StandardDialog
        footerRight={(
          <Button onClick={() => {
            if (editingMember) {
              setMembers((current) => current.map((member) => member.id === editingMember.id ? { ...member, role } : member));
              setEditingMember(null);
            }
          }}>Save Role</Button>
        )}
        onOpenChange={(open) => !open && setEditingMember(null)}
        open={Boolean(editingMember)}
        size="sm"
        title="Edit Role"
      >
        {editingMember ? (
          <div className="grid gap-4">
            <Info label="User" value={editingMember.name} />
            <Field label="Role">
              <select className={selectClass} value={role} onChange={(event) => setRole(event.target.value as TeamMemberRecord["role"])}>
                <option>Admin</option>
                <option>Agent</option>
              </select>
            </Field>
          </div>
        ) : null}
      </StandardDialog>

      <ConfirmationDialog
        cancelLabel="Cancel"
        confirmLabel="Remove User"
        description="Remove this user from the frontend prototype team list."
        onConfirm={() => {
          if (removingMember) {
            setMembers((current) => current.filter((member) => member.id !== removingMember.id));
          }
        }}
        onOpenChange={(open) => !open && setRemovingMember(null)}
        open={Boolean(removingMember)}
        title="Remove User"
      />
    </div>
  );
}

function InviteUserDialog({
  invite,
  onInviteChange,
  onOpenChange,
  onSubmit,
  open,
}: {
  invite: { name: string; email: string; role: TeamMemberRecord["role"] };
  onInviteChange: (invite: { name: string; email: string; role: TeamMemberRecord["role"] }) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
}) {
  return (
    <StandardDialog
      description="Invite an Admin or Agent to this workspace."
      footerRight={<Button onClick={onSubmit}>Send Invite</Button>}
      onOpenChange={onOpenChange}
      open={open}
      size="sm"
      title="Invite User"
    >
      <div className="grid gap-4">
        <Field label="Name"><Input value={invite.name} onChange={(event) => onInviteChange({ ...invite, name: event.target.value })} /></Field>
        <Field label="Email"><Input value={invite.email} onChange={(event) => onInviteChange({ ...invite, email: event.target.value })} /></Field>
        <Field label="Role">
          <select className={selectClass} value={invite.role} onChange={(event) => onInviteChange({ ...invite, role: event.target.value as TeamMemberRecord["role"] })}>
            <option>Admin</option>
            <option>Agent</option>
          </select>
        </Field>
      </div>
    </StandardDialog>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return <label className="grid gap-2"><span className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</span>{children}</label>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</p><p className="mt-1 text-sm text-foreground">{value}</p></div>;
}
