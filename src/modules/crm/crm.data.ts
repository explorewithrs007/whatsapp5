import {
  getAgent,
  getContact,
  mockAgents,
  mockCannedReplies,
  mockContacts,
  mockConversations,
  mockCRMTriggers,
  mockCustomFields,
  mockInternalNotes,
  mockMessages,
  mockTags,
} from "@/data/mock-data";
import type { StatusLabel } from "@/lib/status";

export type Agent = {
  id: string;
  name: string;
  status: StatusLabel;
  initials: string;
};

export type LiveChatConversation = {
  id: string;
  contact: string;
  phone: string;
  email: string;
  tags: string[];
  lastMessage: string;
  assignedAgent: string;
  chatStatus: StatusLabel;
  lastActivity: string;
  historySummary: string;
  initials: string;
  avatarUrl?: string;
};

export type InternalNote = {
  conversationId: string;
  author: string;
  content: string;
  timestamp: string;
};

export type ContactRecord = {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  tags: string[];
  lastInteraction: string;
  customAttributes: Record<string, string>;
  historySummary: string;
  initials: string;
};

export type ConversationHistoryRecord = {
  id: string;
  contactId: string;
  date: string;
  lastMessage: string;
  status: StatusLabel;
  assignedAgent: string;
};

export type ConversationHistoryMessage = {
  id: string;
  conversationId: string;
  direction: "incoming" | "outgoing";
  type: "Text" | "Image" | "Document" | "Media";
  content: string;
  timestamp: string;
  status?: StatusLabel;
};

export type CustomFieldRecord = {
  fieldName: string;
  fieldType: "Text" | "Number" | "Date" | "Dropdown";
  dropdownOptions?: string[];
  status: StatusLabel;
  usedInContacts: number;
};

export type CannedReplyRecord = {
  title: string;
  shortcut: string;
  category: string;
  responsePreview: string;
  status: StatusLabel;
};

export type CRMTriggerRecord = {
  triggerName: string;
  keyword: string;
  response: string;
  status: StatusLabel;
  lastUpdated: string;
};

export type AutoReplyRule = {
  name: string;
  message: string;
  status: StatusLabel;
};

export const agents: Agent[] = mockAgents.map((agent) => ({
  id: agent.id,
  name: agent.name,
  status: agent.status,
  initials: agent.initials,
}));

const baseLiveChatConversations: LiveChatConversation[] = mockConversations.map((conversation) => {
  const contact = getContact(conversation.contactId);
  const agent = getAgent(conversation.assignedAgentId);

  return {
    id: conversation.id,
    contact: contact?.name ?? "Unknown Contact",
    phone: contact?.phone ?? "",
    email: contact?.email ?? "Not available",
    tags: contact?.tags ?? [],
    lastMessage: conversation.lastMessage,
    assignedAgent: agent?.name ?? "Unassigned",
    chatStatus: conversation.status,
    lastActivity: conversation.lastActivity,
    historySummary: contact?.historySummary ?? "No conversation history yet.",
    initials: contact?.initials ?? "UC",
    avatarUrl: contact?.avatarUrl,
  };
});

export const liveChatConversations: LiveChatConversation[] = baseLiveChatConversations;

export const internalNotes: InternalNote[] = mockInternalNotes.map((note) => ({
  conversationId: note.conversationId,
  author: getAgent(note.authorAgentId)?.name ?? "Workspace Agent",
  content: note.note,
  timestamp: note.timestamp,
}));

export const contacts: ContactRecord[] = mockContacts.map((contact) => {
  const conversation = mockConversations.find((item) => item.contactId === contact.id);

  return {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    email: contact.email ?? "Not available",
    avatarUrl: contact.avatarUrl,
    tags: contact.tags,
    lastInteraction: conversation?.lastActivity ?? "No recent activity",
    customAttributes: contact.customAttributes,
    historySummary: contact.historySummary,
    initials: contact.initials,
  };
});

export const tagOptions = mockTags;

export const conversationHistory: ConversationHistoryRecord[] = mockConversations.map((conversation) => {
  const agent = getAgent(conversation.assignedAgentId);

  return {
    id: conversation.id,
    contactId: conversation.contactId,
    date: conversation.lastActivityAt,
    lastMessage: conversation.lastMessage,
    status: conversation.status,
    assignedAgent: agent?.name ?? "Unassigned",
  };
});

export const conversationHistoryMessages: ConversationHistoryMessage[] = mockMessages.map((message) => ({
  id: message.id,
  conversationId: message.conversationId,
  direction: message.direction,
  type: message.type,
  content: message.content,
  timestamp: message.timestamp,
  status: message.status,
}));

export const customFields: CustomFieldRecord[] = mockCustomFields;

export const cannedReplies: CannedReplyRecord[] = mockCannedReplies.map((reply) => ({
  title: reply.title,
  shortcut: reply.shortcut,
  category: reply.category,
  responsePreview: reply.message,
  status: reply.status,
}));

export const cannedReplyCategories = ["Sales", "Support", "General", "Appointment"];

const triggerNames: Record<string, string> = {
  appointment: "Appointment Help",
  hours: "Business Hours",
  invoice: "Invoice Support",
  location: "Location Reply",
  price: "Pricing Reply",
};

export const crmTriggers: CRMTriggerRecord[] = mockCRMTriggers.map((trigger) => ({
  ...trigger,
  triggerName: triggerNames[trigger.keyword] ?? `${trigger.keyword} Reply`,
}));

export const autoReplyRules: AutoReplyRule[] = [
  {
    name: "Welcome Message",
    message: "Send a greeting when a new WhatsApp conversation starts.",
    status: "Active",
  },
  {
    name: "Away Message",
    message: "Send a response when agents are unavailable.",
    status: "Disabled",
  },
  {
    name: "Business-Hours Reply",
    message: "Send business-hours information for common timing queries.",
    status: "Active",
  },
];
