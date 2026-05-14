import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Download, FileText, Image, Lock, Paperclip, Send, Sparkles, Users, Video, type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ContactIdentityBlock, DetailField, DetailTagList, InternalNoteCard } from "@/components/ContactDetails";
import { SearchInput } from "@/components/SearchInput";
import { StandardDialog } from "@/components/StandardDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@/components/ui/dropdown-menu";
import { Tooltip } from "@/components/ui/tooltip";
import { WORKSPACE_USER } from "@/lib/constants";
import { resolveTemplateVariables } from "@/lib/templateVariables";
import { cn } from "@/lib/utils";
import { agents } from "@/modules/crm/crm.data";
import {
  approvedInboxTemplates,
  cannedReplies,
  conversations,
  internalNotes,
  messages,
  type CannedReply,
  type Conversation,
  type ConversationMessage,
  type InboxInternalNote,
} from "@/modules/channels/channels.data";

type SelectedAttachment = {
  id: string;
  type: "Image" | "Document" | "Media";
  name: string;
};

const mockAttachments: Record<SelectedAttachment["type"], string> = {
  Image: "reference-image.png",
  Document: "appointment-confirmation.pdf",
  Media: "product-demo.mp4",
};

const mockAttachmentMeta: Record<SelectedAttachment["type"], Pick<ConversationMessage, "caption" | "duration" | "fileSize" | "imageUrl">> = {
  Image: { caption: "Uploaded reference image" },
  Document: { fileSize: "128 KB" },
  Media: { duration: "0:42" },
};

const isWorkspaceAdmin = WORKSPACE_USER.role === "Admin" || WORKSPACE_USER.role === "Workspace Admin";
const defaultAssignedAgentFilter = isWorkspaceAdmin ? "All Agents" : WORKSPACE_USER.name;
const composerMaxHeight = 132;

function insertReplyText(currentText: string, reply: CannedReply, command?: string) {
  if (command) {
    return currentText.replace(command, reply.message);
  }

  return currentText ? `${currentText}\n${reply.message}` : reply.message;
}

function resizeComposerTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) {
    return;
  }

  textarea.style.height = "auto";
  const nextHeight = Math.min(textarea.scrollHeight, composerMaxHeight);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > composerMaxHeight ? "auto" : "hidden";
}

export function WhatsAppInboxPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversationRows, setConversationRows] = useState<Conversation[]>(conversations);
  const [messageRows, setMessageRows] = useState<ConversationMessage[]>(messages);
  const [assignedAgentFilter, setAssignedAgentFilter] = useState(defaultAssignedAgentFilter);
  const [selectedConversationId, setSelectedConversationId] = useState(conversations[0].id);
  const [composerText, setComposerText] = useState("");
  const [selectedAttachments, setSelectedAttachments] = useState<SelectedAttachment[]>([]);
  const [selectedReplyShortcut, setSelectedReplyShortcut] = useState<string | null>(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<ConversationMessage | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState("");
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return conversationRows;
    }

    return conversationRows.filter((conversation) =>
      [conversation.contactName, conversation.phoneNumber, conversation.lastMessage]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [conversationRows, searchQuery]);

  const filteredByAssignedAgent = useMemo(() => {
    if (assignedAgentFilter === "All Agents") {
      return filteredConversations;
    }

    if (assignedAgentFilter === "Unassigned") {
      return filteredConversations.filter(
        (conversation) => !conversation.assignedAgent || conversation.assignedAgent === "Unassigned",
      );
    }

    return filteredConversations.filter((conversation) => conversation.assignedAgent === assignedAgentFilter);
  }, [assignedAgentFilter, filteredConversations]);

  useEffect(() => {
    if (!filteredByAssignedAgent.length) {
      return;
    }

    if (!filteredByAssignedAgent.some((conversation) => conversation.id === selectedConversationId)) {
      setSelectedConversationId(filteredByAssignedAgent[0].id);
    }
  }, [filteredByAssignedAgent, selectedConversationId]);

  const selectedConversation =
    conversationRows.find((conversation) => conversation.id === selectedConversationId) ?? conversationRows[0];
  const isComposerDisabled = selectedConversation.status === "Closed";
  const selectedMessages = messageRows.filter((message) => message.conversationId === selectedConversation.id);
  const selectedInternalNotes = internalNotes
    .filter((note) => note.conversationId === selectedConversation.id)
    .slice(0, 2);
  const activeSlashCommand = composerText.match(/(?:^|\s)(\/[a-z]*)$/)?.[1] ?? "";
  const slashMatches = activeSlashCommand
    ? cannedReplies.filter((reply) => reply.shortcut.startsWith(activeSlashCommand.toLowerCase()))
    : [];
  const canSendMessage =
    !isComposerDisabled &&
    (Boolean(composerText.trim()) || selectedAttachments.length > 0 || Boolean(selectedTemplateName));

  useEffect(() => {
    const messageArea = messageAreaRef.current;

    if (!messageArea) {
      return;
    }

    messageArea.scrollTop = messageArea.scrollHeight;
  }, [selectedConversationId, selectedMessages.length]);

  useEffect(() => {
    resizeComposerTextarea(composerTextareaRef.current);
  }, [composerText]);

  const updateComposerText = (nextText: string) => {
    setComposerText(nextText);
  };

  const applyCannedReply = (reply: CannedReply) => {
    updateComposerText(insertReplyText(composerText, reply, activeSlashCommand));
    setSelectedReplyShortcut(reply.shortcut);
    setSelectedTemplateName(null);
  };

  const templateContext = {
    assignedAgent: selectedConversation.assignedAgent,
    contactName: selectedConversation.contactName,
    customAttributes: selectedConversation.customAttributes,
    email: selectedConversation.email,
    phoneNumber: selectedConversation.phoneNumber,
  };

  const addAttachment = (type: SelectedAttachment["type"]) => {
    setSelectedAttachments((currentAttachments) => [
      ...currentAttachments,
      {
        id: `${type}-${currentAttachments.length + 1}-${Date.now()}`,
        type,
        name: mockAttachments[type],
      },
    ]);
  };

  const removeAttachment = (id: string) => {
    setSelectedAttachments((currentAttachments) =>
      currentAttachments.filter((attachment) => attachment.id !== id),
    );
  };

  const handleDownloadAttachment = (message: ConversationMessage) => {
    const fileName = getAttachmentFileName(message);
    setDownloadFeedback(`Download started for ${fileName}`);
    window.setTimeout(() => setDownloadFeedback(""), 2500);
  };

  const handleSendMessage = () => {
    if (!canSendMessage) {
      return;
    }

    const timestamp = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date());
    const trimmedText = resolveTemplateVariables(composerText.trim(), templateContext);
    const messageIdBase = Date.now();
    const nextMessages: ConversationMessage[] = [];

    if (trimmedText) {
      nextMessages.push({
        body: trimmedText,
        conversationId: selectedConversation.id,
        direction: "outgoing",
        id: `local-text-${messageIdBase}`,
        status: "Sent",
        timestamp,
        type: "Text",
      });
    }

    selectedAttachments.forEach((attachment, index) => {
      nextMessages.push({
        body: attachment.name,
        conversationId: selectedConversation.id,
        direction: "outgoing",
        fileName: attachment.name,
        id: `local-attachment-${messageIdBase}-${index}`,
        status: "Sent",
        timestamp,
        type: attachment.type,
        ...mockAttachmentMeta[attachment.type],
      });
    });

    if (!nextMessages.length && selectedTemplateName) {
      nextMessages.push({
        body: selectedTemplateName,
        conversationId: selectedConversation.id,
        direction: "outgoing",
        id: `local-template-${messageIdBase}`,
        status: "Sent",
        timestamp,
        type: "Text",
      });
    }

    setMessageRows((currentRows) => [...currentRows, ...nextMessages]);
    setConversationRows((currentRows) => {
      const previewMessage =
        trimmedText ||
        (selectedAttachments[0] ? `${selectedAttachments[0].type}: ${selectedAttachments[0].name}` : selectedTemplateName) ||
        selectedConversation.lastMessage;
      const updatedRows = currentRows.map((conversation) =>
        conversation.id === selectedConversation.id
          ? { ...conversation, lastMessage: previewMessage, lastMessageTime: timestamp }
          : conversation,
      );
      const updatedConversation = updatedRows.find((conversation) => conversation.id === selectedConversation.id);

      return updatedConversation
        ? [updatedConversation, ...updatedRows.filter((conversation) => conversation.id !== selectedConversation.id)]
        : updatedRows;
    });
    updateComposerText("");
    setSelectedAttachments([]);
    setSelectedReplyShortcut(null);
    setSelectedTemplateName(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {downloadFeedback ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-soft">
          {downloadFeedback}
        </div>
      ) : null}
      <section className="grid min-h-0 flex-1 overflow-hidden bg-card grid-cols-[320px_minmax(0,1fr)_320px] 2xl:grid-cols-[330px_minmax(0,1fr)_330px] min-[1600px]:grid-cols-[340px_minmax(0,1fr)_340px]">
        <section className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-r border-border px-2.5 py-2.5">
          <div className="mb-2.5 shrink-0">
            <h2 className="text-base font-semibold text-foreground">Inbox View</h2>
            <p className="mt-1 text-sm text-muted-foreground">WhatsApp conversations only.</p>
          </div>
          <SearchInput
            className="w-full"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search name, phone, keyword"
            value={searchQuery}
          />
          {isWorkspaceAdmin ? (
            <label className="mt-2.5 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-normal text-muted">Assigned Agent</span>
              <AssignedAgentFilter
                onChange={setAssignedAgentFilter}
                value={assignedAgentFilter}
              />
            </label>
          ) : null}
          <div className="subtle-scrollbar mt-2.5 min-h-0 w-full flex-1 overflow-y-auto border-t border-border">
            {filteredByAssignedAgent.length ? (
              filteredByAssignedAgent.map((conversation) => {
                const isSelected = conversation.id === selectedConversation.id;

                return (
                  <button
                    key={conversation.id}
                    className={cn(
                      "flex min-h-[60px] w-full items-center gap-2 border-b border-border px-2 py-1.5 text-left transition-colors last:border-b-0",
                      isSelected
                        ? "bg-whatsapp-light shadow-[inset_3px_0_0_rgba(0,150,136,0.55)]"
                        : "bg-card hover:bg-slate-50",
                    )}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    type="button"
                  >
                    <UserAvatar
                      avatarUrl={conversation.avatarUrl}
                      compact
                      initials={conversation.initials}
                      name={conversation.contactName}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                          {conversation.contactName}
                        </p>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{conversation.lastMessage}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {conversation.assignedAgent ?? "Unassigned"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-xs text-muted">{conversation.lastMessageTime}</span>
                      <StatusBadge status={conversation.status} />
                    </div>
                  </button>
                );
              })
            ) : (
              <EmptyState
                title="No conversations found"
                description="Try searching by contact name, phone number, keyword, or assigned agent."
              />
            )}
          </div>
        </section>

        <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-border px-4 py-2.5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      avatarUrl={selectedConversation.avatarUrl}
                      compact
                      initials={selectedConversation.initials}
                      name={selectedConversation.contactName}
                      size="sm"
                    />
                    <div>
                      <h2 className="text-base font-semibold text-foreground">{selectedConversation.contactName}</h2>
                      <p className="text-sm text-muted-foreground">{selectedConversation.phoneNumber}</p>
                    </div>
                  </div>
                </div>
                <StatusBadge status={selectedConversation.status} />
              </div>
            </div>

            <div ref={messageAreaRef} className="subtle-scrollbar min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-slate-50/60 px-4 pb-3 pt-2.5">
              {selectedMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onDownload={handleDownloadAttachment}
                  onViewImage={setPreviewAttachment}
                />
              ))}
            </div>

            <div className="shrink-0 border-t border-border bg-card p-2">
              {isComposerDisabled ? (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-sm text-muted-foreground">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <p>This conversation is closed. Reopen it from CRM &rarr; Live Chat to send a new message.</p>
                </div>
              ) : (
                <div className="relative rounded-xl border border-border bg-card p-1.5 focus-within:border-whatsapp/40 focus-within:ring-1 focus-within:ring-whatsapp/25">
                  {activeSlashCommand ? (
                  <div className="absolute bottom-[calc(100%+0.5rem)] left-3 z-20 w-72 rounded-xl border border-border bg-card p-2 shadow-soft">
                    {slashMatches.length ? (
                      slashMatches.map((reply) => (
                        <button
                          key={reply.shortcut}
                          className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                          onClick={() => applyCannedReply(reply)}
                          type="button"
                        >
                          <span className="text-sm font-semibold text-whatsapp-dark">{reply.shortcut}</span>
                          <span className="text-sm text-muted-foreground">{reply.label}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-muted-foreground">No shortcut found</p>
                    )}
                  </div>
                ) : null}

                <textarea
                  className="subtle-scrollbar max-h-[132px] min-h-11 w-full resize-none overflow-y-hidden border-0 bg-transparent px-1 py-2 text-sm leading-5 text-foreground placeholder:text-muted focus-visible:outline-none"
                  onChange={(event) => updateComposerText(event.target.value)}
                  placeholder="Reply to this WhatsApp conversation"
                  ref={composerTextareaRef}
                  rows={1}
                  value={composerText}
                />

                <div className="mt-1.5 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="scrollbar-hide flex max-h-7 min-w-0 flex-1 gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pr-2">
                  {selectedAttachments.map((attachment) => (
                    <button
                      key={attachment.id}
                      className="inline-flex h-7 shrink-0 items-center gap-2 rounded-full border border-border bg-slate-50 px-3 text-xs text-muted-foreground"
                      onClick={() => removeAttachment(attachment.id)}
                      type="button"
                    >
                      {attachment.type}: {attachment.name}
                      <span aria-hidden="true" className="text-muted">x</span>
                    </button>
                  ))}
                  {selectedReplyShortcut ? (
                    <button
                      className="inline-flex h-7 shrink-0 items-center gap-2 rounded-full border border-border bg-slate-50 px-3 text-xs text-muted-foreground"
                      onClick={() => setSelectedReplyShortcut(null)}
                      type="button"
                    >
                      Canned Reply: {selectedReplyShortcut}
                      <span aria-hidden="true" className="text-muted">x</span>
                    </button>
                  ) : null}
                  {selectedTemplateName ? (
                    <button
                      className="inline-flex h-7 shrink-0 items-center gap-2 rounded-full border border-border bg-slate-50 px-3 text-xs text-muted-foreground"
                      onClick={() => setSelectedTemplateName(null)}
                      type="button"
                    >
                      Template: {selectedTemplateName}
                      <span aria-hidden="true" className="text-muted">x</span>
                    </button>
                  ) : null}
                </div>

                  <div className="flex shrink-0 items-center justify-end gap-1.5">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <span>
                          <Tooltip label="Attach image, document, or media">
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Attach image, document, or media"
                            >
                              <Paperclip className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </span>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content align="start" className="z-50 w-72 rounded-xl border border-border bg-card p-2 shadow-soft">
                          <DropdownMenu.Label className="px-3 py-2 text-sm font-semibold text-foreground">
                            Attach to conversation
                          </DropdownMenu.Label>
                          {[
                            { label: "Image", helper: "Upload image files", icon: Image },
                            { label: "Document", helper: "Upload PDF or document", icon: FileText },
                            { label: "Media", helper: "Upload media file", icon: Video },
                          ].map((item) => {
                            const Icon = item.icon;

                            return (
                              <DropdownMenu.Item
                                key={item.label}
                                className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 outline-none hover:bg-slate-50"
                                onSelect={() => addAttachment(item.label as SelectedAttachment["type"])}
                              >
                                <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <span>
                                  <span className="block text-sm font-medium text-foreground">{item.label}</span>
                                  <span className="block text-xs text-muted-foreground">{item.helper}</span>
                                </span>
                              </DropdownMenu.Item>
                            );
                          })}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <span>
                      <Tooltip label="Use canned replies">
                        <Button size="icon" variant="ghost" aria-label="Use canned replies">
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </span>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" className="z-50 w-80 rounded-xl border border-border bg-card p-2 shadow-soft">
                      {cannedReplies.map((reply) => (
                        <DropdownMenu.Item
                          key={reply.shortcut}
                          className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 outline-none hover:bg-slate-50"
                          onSelect={() => {
                            updateComposerText(insertReplyText(composerText, reply));
                            setSelectedReplyShortcut(reply.shortcut);
                            setSelectedTemplateName(null);
                          }}
                        >
                          <span className="text-sm font-semibold text-whatsapp-dark">{reply.shortcut}</span>
                          <span>
                            <span className="block text-sm font-medium text-foreground">{reply.label}</span>
                            <span className="block text-xs text-muted-foreground">{reply.message}</span>
                          </span>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <span>
                      <Tooltip label="Use approved template">
                        <Button size="icon" variant="ghost" aria-label="Use approved template">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    </span>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" className="z-50 w-80 rounded-xl border border-border bg-card p-2 shadow-soft">
                      {approvedInboxTemplates.map((template) => (
                        <DropdownMenu.Item
                          key={template.name}
                          className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-slate-50"
                          onSelect={() => {
                            updateComposerText(resolveTemplateVariables(template.body, templateContext));
                            setSelectedTemplateName(template.name);
                            setSelectedReplyShortcut(null);
                          }}
                        >
                          <span className="block text-sm font-medium text-foreground">{template.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {resolveTemplateVariables(template.body, templateContext)}
                          </span>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>

                <Tooltip label="Send message">
                  <Button
                    aria-label="Send message"
                    disabled={!canSendMessage}
                    onClick={handleSendMessage}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </Tooltip>
                </div>
              </div>
              </div>
              )}
            </div>
          </div>
        </section>

        <section className="subtle-scrollbar h-full min-h-0 w-full min-w-0 overflow-y-auto border-l border-border px-2.5 py-2.5">
          <h2 className="text-base font-semibold text-foreground">Contact Profile</h2>
          <div className="mt-3">
            <ContactIdentityBlock
              avatarUrl={selectedConversation.avatarUrl}
              initials={selectedConversation.initials}
              name={selectedConversation.contactName}
              phone={selectedConversation.phoneNumber}
            />
          </div>
          <div className="mt-3 w-full space-y-3">
            <DetailField label="Contact Name" value={selectedConversation.contactName} />
            <DetailField label="Phone Number" value={selectedConversation.phoneNumber} />
            <DetailField label="Email" value={selectedConversation.email ?? "Not available"} />
            <DetailField label="Tags">
              <DetailTagList tags={selectedConversation.tags} />
            </DetailField>
            <DetailField label="Conversation Status">
              <div className="mt-2">
                <StatusBadge status={selectedConversation.status} />
              </div>
            </DetailField>
            <DetailField label="Assigned Agent" value={selectedConversation.assignedAgent ?? "Unassigned"} />
            <DetailField label="Conversation History" value={selectedConversation.historySummary} />
            <InternalNotesContext notes={selectedInternalNotes} />
          </div>
        </section>
      </section>
      <AttachmentPreviewDialog
        attachment={previewAttachment}
        onDownload={handleDownloadAttachment}
        onOpenChange={(open) => !open && setPreviewAttachment(null)}
      />
    </div>
  );
}

function AssignedAgentFilter({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-label="Filter by assigned agent"
          className="h-9 w-36 justify-between px-3 text-sm font-normal"
          type="button"
          variant="outline"
        >
          <span className="truncate">{value}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 w-64 rounded-xl border border-border bg-card p-1.5 shadow-soft"
          sideOffset={6}
        >
          <AssignedAgentFilterItem
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            label="All Agents"
            onSelect={() => onChange("All Agents")}
          />
          <AssignedAgentFilterItem
            icon={<span className="h-2.5 w-2.5 rounded-full bg-slate-300" />}
            label="Unassigned"
            onSelect={() => onChange("Unassigned")}
          />
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          {agents.map((agent) => (
            <AssignedAgentFilterItem
              key={agent.id}
              icon={<span className={cn("h-2.5 w-2.5 rounded-full", getAgentStatusDotClass(agent.status))} />}
              label={agent.name}
              meta={agent.status}
              onSelect={() => onChange(agent.name)}
            />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function AssignedAgentFilterItem({
  icon,
  label,
  meta,
  onSelect,
}: {
  icon: ReactNode;
  label: string;
  meta?: string;
  onSelect: () => void;
}) {
  return (
    <DropdownMenu.Item
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none hover:bg-slate-50 focus:bg-slate-50"
      onSelect={onSelect}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-foreground">{label}</span>
      {meta ? <span className="shrink-0 text-xs text-muted-foreground">{meta}</span> : null}
    </DropdownMenu.Item>
  );
}

function getAgentStatusDotClass(status: string) {
  if (status === "Active") {
    return "bg-whatsapp";
  }

  if (status === "Away") {
    return "bg-warning";
  }

  return "bg-slate-300";
}

function MessageBubble({
  message,
  onDownload,
  onViewImage,
}: {
  message: ConversationMessage;
  onDownload: (message: ConversationMessage) => void;
  onViewImage: (message: ConversationMessage) => void;
}) {
  const isOutgoing = message.direction === "outgoing";

  return (
    <div className={cn("flex", isOutgoing ? "justify-end" : "justify-start")}>
      <div className="max-w-[76%]">
        <div
          className={cn(
            "rounded-2xl border px-3 py-2",
            isOutgoing ? "border-whatsapp/20 bg-whatsapp-light" : "border-border bg-card",
          )}
        >
          <MessageContent message={message} onDownload={onDownload} onViewImage={onViewImage} />
        </div>
        <MessageMeta message={message} />
      </div>
    </div>
  );
}

function MessageContent({
  message,
  onDownload,
  onViewImage,
}: {
  message: ConversationMessage;
  onDownload: (message: ConversationMessage) => void;
  onViewImage: (message: ConversationMessage) => void;
}) {
  if (message.type === "Image") {
    return <MessageAttachmentCard message={message} onDownload={onDownload} onViewImage={onViewImage} />;
  }

  if (message.type === "Document") {
    return <MessageAttachmentCard message={message} onDownload={onDownload} onViewImage={onViewImage} />;
  }

  if (message.type === "Media") {
    return <MessageAttachmentCard message={message} onDownload={onDownload} onViewImage={onViewImage} />;
  }

  return <p className="text-sm leading-5 text-foreground">{message.body}</p>;
}

function MessageAttachmentCard({
  message,
  onDownload,
  onViewImage,
}: {
  message: ConversationMessage;
  onDownload: (message: ConversationMessage) => void;
  onViewImage: (message: ConversationMessage) => void;
}) {
  const isImage = message.type === "Image";
  const Icon = getAttachmentIcon(message.type);
  const fileName = getAttachmentFileName(message);
  const meta = getAttachmentMeta(message);
  const downloadLabel = getDownloadLabel(message.type);

  if (isImage) {
    return (
      <div className="w-[220px] max-w-full">
        <button
          className="relative block w-full overflow-hidden rounded-xl border border-border bg-slate-50 text-left transition-colors hover:border-whatsapp/30 hover:bg-whatsapp-light/60"
          onClick={() => onViewImage(message)}
          title="Open image"
          type="button"
        >
          {message.imageUrl ? (
            <img
              alt={message.caption ?? fileName}
              className="h-40 w-full object-cover"
              src={message.imageUrl}
            />
          ) : (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <Image className="h-6 w-6" />
            </div>
          )}
        </button>
        <div className="mt-1.5 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-foreground">{message.caption ?? message.body}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{fileName}</p>
          </div>
          <DownloadAction label="Download image" onDownload={() => onDownload(message)} />
        </div>
      </div>
    );
  }

  return (
    <button
      className="flex min-w-[220px] max-w-[300px] cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white/70 p-2.5 text-left transition-colors hover:border-whatsapp/30 hover:bg-whatsapp-light/60"
      onClick={() => onDownload(message)}
      type="button"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
          {meta ? <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p> : null}
        </div>
      </div>
      <DownloadAction label={downloadLabel} onDownload={() => onDownload(message)} />
    </button>
  );
}

function DownloadAction({
  label,
  onDownload,
}: {
  label: string;
  onDownload: () => void;
}) {
  return (
    <Tooltip label={label}>
      <Button
        aria-label={label}
        className="h-7 w-7 shrink-0"
        onClick={(event) => {
          event.stopPropagation();
          onDownload();
        }}
        size="icon"
        variant="ghost"
      >
        <Download className="h-4 w-4" />
      </Button>
    </Tooltip>
  );
}

function MessageMeta({ message }: { message: ConversationMessage }) {
  const isOutgoing = message.direction === "outgoing";

  return (
    <div
      className={cn(
        "mt-1 text-xs",
        isOutgoing ? "text-right text-whatsapp-dark" : "text-left text-muted",
      )}
    >
      {message.timestamp}
      {isOutgoing && message.status ? (
        <span className="text-muted-foreground"> &middot; {message.status}</span>
      ) : null}
    </div>
  );
}

function AttachmentPreviewDialog({
  attachment,
  onDownload,
  onOpenChange,
}: {
  attachment: ConversationMessage | null;
  onDownload: (message: ConversationMessage) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const imageAttachment = attachment?.type === "Image" ? attachment : null;

  return (
    <StandardDialog
      footerRight={imageAttachment ? (
        <Button onClick={() => onDownload(imageAttachment)} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      ) : null}
      onOpenChange={onOpenChange}
      open={Boolean(imageAttachment)}
      title="Image Preview"
    >
      {imageAttachment ? <ImagePreviewContent attachment={imageAttachment} /> : null}
    </StandardDialog>
  );
}

function ImagePreviewContent({ attachment }: { attachment: ConversationMessage }) {
  const fileName = getAttachmentFileName(attachment);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-slate-50">
        {attachment.imageUrl ? (
          <img alt={attachment.caption ?? fileName} className="max-h-[360px] w-full object-cover" src={attachment.imageUrl} />
        ) : (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Image className="h-8 w-8" />
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{fileName}</p>
        {attachment.caption ? <p className="mt-1 text-sm text-muted-foreground">{attachment.caption}</p> : null}
      </div>
    </div>
  );
}

function InternalNotesContext({ notes }: { notes: InboxInternalNote[] }) {
  return (
    <div>
      <DetailField label="Internal Notes">
        <></>
      </DetailField>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Notes are managed in CRM &rarr; Live Chat.</p>
      <div className="mt-3 space-y-2">
        {notes.length ? (
          notes.map((note) => (
            <InternalNoteCard
              key={note.id}
              author={note.author}
              className="p-3"
              content={note.content}
              timestamp={note.timestamp}
            />
          ))
        ) : (
          <p className="rounded-xl border border-border bg-slate-50 p-4 text-sm text-muted-foreground">
            No internal notes yet.
          </p>
        )}
      </div>
    </div>
  );
}

function getAttachmentFileName(message: ConversationMessage) {
  return message.fileName ?? message.body;
}

function getAttachmentIcon(type: ConversationMessage["type"]): LucideIcon {
  if (type === "Document") {
    return FileText;
  }

  if (type === "Media") {
    return Video;
  }

  return Image;
}

function getAttachmentMeta(message: ConversationMessage) {
  return message.fileSize ?? message.duration;
}

function getDownloadLabel(type: ConversationMessage["type"]) {
  if (type === "Document") {
    return "Download document";
  }

  if (type === "Media") {
    return "Download media";
  }

  return "Download image";
}
