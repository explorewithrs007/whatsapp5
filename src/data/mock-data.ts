import type { StatusLabel } from "@/lib/status";

export type MockAgent = {
  id: string;
  name: string;
  role: string;
  status: StatusLabel;
  initials: string;
  avatarUrl?: string;
};

export type MockContact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  initials: string;
  tags: string[];
  customAttributes: Record<string, string>;
  historySummary: string;
};

export type MockConversation = {
  id: string;
  contactId: string;
  assignedAgentId?: string;
  status: StatusLabel;
  lastMessage: string;
  lastActivity: string;
  lastActivityAt: string;
};

export type MockMessage = {
  id: string;
  conversationId: string;
  direction: "incoming" | "outgoing";
  type: "Text" | "Image" | "Document" | "Media";
  content: string;
  caption?: string;
  duration?: string;
  fileName?: string;
  fileSize?: string;
  imageUrl?: string;
  timestamp: string;
  status?: StatusLabel;
};

export type MockInternalNote = {
  id: string;
  conversationId: string;
  authorAgentId: string;
  note: string;
  timestamp: string;
};

export type MockCannedReply = {
  title: string;
  shortcut: string;
  label: string;
  category: string;
  message: string;
  status: StatusLabel;
};

export type MockCRMTrigger = {
  keyword: string;
  response: string;
  status: StatusLabel;
  lastUpdated: string;
};

export const mockAgents: MockAgent[] = [
  { id: "agent-meera", name: "Meera Shah", role: "Support Agent", status: "Active", initials: "MS" },
  { id: "agent-kabir", name: "Kabir Rao", role: "Support Agent", status: "Away", initials: "KR" },
  { id: "agent-nisha", name: "Nisha Verma", role: "Support Lead", status: "Active", initials: "NV" },
  { id: "agent-dev", name: "Dev Iyer", role: "Support Agent", status: "Offline", initials: "DI" },
];

export const mockContacts: MockContact[] = [
  {
    id: "contact-priya",
    name: "Priya Kapoor",
    phone: "+91 98765 43210",
    email: "priya.kapoor@example.com",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Priya%20Kapoor&backgroundColor=ECFDF5&fontWeight=600",
    initials: "PK",
    tags: ["Appointment", "Priority"],
    customAttributes: {
      "Appointment Date": "2026-05-14",
      Budget: "50000",
      City: "Mumbai",
      "Order ID": "ORD-1042",
      Requirement: "Appointment confirmation",
      "Customer Type": "Existing Customer",
    },
    historySummary: "3 conversations, last closed 2 days ago.",
  },
  {
    id: "contact-rohan",
    name: "Rohan Mehta",
    phone: "+91 99887 77665",
    email: "rohan.mehta@example.com",
    initials: "RM",
    tags: ["Document", "Pending"],
    customAttributes: {
      "Appointment Date": "2026-05-16",
      Budget: "25000",
      City: "Pune",
      Requirement: "Invoice document",
      "Customer Type": "Lead",
      "Lead Stage": "Contacted",
    },
    historySummary: "Pending invoice document follow-up.",
  },
  {
    id: "contact-anika",
    name: "Anika Bose",
    phone: "+91 91234 56780",
    email: "anika.bose@example.com",
    initials: "AB",
    tags: ["Support"],
    customAttributes: {
      Budget: "15000",
      City: "Kolkata",
      "Customer Type": "Existing Customer",
      Requirement: "Support follow-up",
      "Lead Stage": "Closed",
    },
    historySummary: "Closed conversation after support response.",
  },
  {
    id: "contact-vikram",
    name: "Vikram Singh",
    phone: "+91 90000 11223",
    email: "vikram.singh@example.com",
    initials: "VS",
    tags: ["Product"],
    customAttributes: {
      Budget: "35000",
      City: "Delhi",
      "Customer Type": "Lead",
      Requirement: "Document upload support",
      "Lead Stage": "New",
    },
    historySummary: "New customer conversation about document uploads.",
  },
];

const generatedSMBContacts: MockContact[] = Array.from({ length: 38 }, (_, index) => {
  const customerNumber = index + 5;

  return {
    id: `contact-smb-${customerNumber}`,
    name: `SMB Customer ${customerNumber}`,
    phone: `+91 90000 11${String(220 + index).padStart(3, "0")}`,
    email: undefined,
    initials: `C${customerNumber}`,
    tags: [],
    customAttributes: {},
    historySummary: "Recent WhatsApp conversation from Team Inbox.",
  };
});

mockContacts.push(...generatedSMBContacts);

const generatedSMBConversations: MockConversation[] = Array.from({ length: 38 }, (_, index) => {
  const statusCycle: StatusLabel[] = ["Open", "Pending", "Closed"];
  const agentCycle = ["agent-meera", "agent-kabir", "agent-nisha", "agent-dev", undefined];
  const customerNumber = index + 5;

  return {
    id: `conv-extra-${customerNumber}`,
    contactId: `contact-smb-${customerNumber}`,
    assignedAgentId: agentCycle[index % agentCycle.length],
    status: statusCycle[index % statusCycle.length],
    lastMessage:
      index % 3 === 0
        ? "Please confirm business hours."
        : index % 3 === 1
          ? "Can you share the invoice document?"
          : "I need help with my appointment.",
    lastActivity: index < 9 ? `${index + 1} min ago` : `${index + 1} hrs ago`,
    lastActivityAt: "13 May 2026",
  };
});

export const mockConversations: MockConversation[] = [
  {
    id: "conv-1",
    contactId: "contact-priya",
    assignedAgentId: "agent-meera",
    status: "Open",
    lastMessage: "Can you confirm my appointment time?",
    lastActivity: "10:42 AM",
    lastActivityAt: "13 May 2026",
  },
  {
    id: "conv-2",
    contactId: "contact-rohan",
    assignedAgentId: "agent-kabir",
    status: "Pending",
    lastMessage: "Please share the invoice document.",
    lastActivity: "09:18 AM",
    lastActivityAt: "13 May 2026",
  },
  {
    id: "conv-3",
    contactId: "contact-anika",
    assignedAgentId: "agent-nisha",
    status: "Closed",
    lastMessage: "Thanks, this is completed.",
    lastActivity: "Yesterday",
    lastActivityAt: "12 May 2026",
  },
  {
    id: "conv-4",
    contactId: "contact-vikram",
    status: "Open",
    lastMessage: "Do you support document uploads?",
    lastActivity: "Yesterday",
    lastActivityAt: "12 May 2026",
  },
  ...generatedSMBConversations,
];

export const mockMessages: MockMessage[] = [
  {
    id: "msg-1",
    conversationId: "conv-1",
    direction: "incoming",
    type: "Text",
    content: "Hi, can you confirm my appointment time?",
    timestamp: "10:36 AM",
  },
  {
    id: "msg-2",
    conversationId: "conv-1",
    direction: "outgoing",
    type: "Text",
    content: "Hi Priya, your appointment is confirmed for tomorrow at 3:00 PM.",
    timestamp: "10:39 AM",
    status: "Read",
  },
  {
    id: "msg-3",
    conversationId: "conv-1",
    direction: "incoming",
    type: "Image",
    content: "Uploaded reference image",
    caption: "Uploaded reference image",
    fileName: "reference-image.jpg",
    imageUrl: "https://placehold.co/560x360/ECFDF5/128C7E?text=Reference+Image",
    timestamp: "10:41 AM",
  },
  {
    id: "msg-4",
    conversationId: "conv-1",
    direction: "outgoing",
    type: "Document",
    content: "Appointment confirmation.pdf",
    fileName: "appointment-confirmation.pdf",
    fileSize: "128 KB",
    timestamp: "10:42 AM",
    status: "Delivered",
  },
  {
    id: "msg-7",
    conversationId: "conv-1",
    direction: "outgoing",
    type: "Media",
    content: "Product demo.mp4",
    duration: "0:42",
    fileName: "product-demo.mp4",
    timestamp: "10:45 AM",
    status: "Sent",
  },
  {
    id: "msg-5",
    conversationId: "conv-2",
    direction: "incoming",
    type: "Document",
    content: "Invoice request details.pdf",
    fileName: "invoice-request-details.pdf",
    fileSize: "92 KB",
    timestamp: "09:12 AM",
  },
  {
    id: "msg-6",
    conversationId: "conv-4",
    direction: "incoming",
    type: "Text",
    content: "Do you support document uploads?",
    timestamp: "Yesterday",
  },
  ...generatedSMBConversations.flatMap((conversation, index) => {
    const customerMessage = conversation.lastMessage;
    const agentReply =
      index % 3 === 0
        ? "Our business hours are Monday to Friday, 10:00 AM to 6:00 PM."
        : index % 3 === 1
          ? "Sure, I can help with the invoice document."
          : "I can help with your appointment details.";

    return [
      {
        id: `${conversation.id}-msg-1`,
        conversationId: conversation.id,
        direction: "incoming" as const,
        type: "Text" as const,
        content: customerMessage,
        timestamp: conversation.lastActivity,
      },
      {
        id: `${conversation.id}-msg-2`,
        conversationId: conversation.id,
        direction: "outgoing" as const,
        type: "Text" as const,
        content: agentReply,
        timestamp: conversation.lastActivity,
        status: "Sent" as StatusLabel,
      },
    ];
  }),
];

export const mockInternalNotes: MockInternalNote[] = [
  {
    id: "note-1",
    conversationId: "conv-1",
    authorAgentId: "agent-meera",
    note: "Customer asked to confirm appointment timing.",
    timestamp: "Today, 10:45 AM",
  },
  {
    id: "note-2",
    conversationId: "conv-1",
    authorAgentId: "agent-kabir",
    note: "Follow up if customer asks for reschedule.",
    timestamp: "Yesterday, 5:20 PM",
  },
  {
    id: "note-3",
    conversationId: "conv-2",
    authorAgentId: "agent-kabir",
    note: "Customer is waiting for invoice document.",
    timestamp: "Today, 9:30 AM",
  },
];

export const mockTags = ["Appointment", "Priority", "Document", "Pending", "Support", "Product"];

export const mockCustomFields = [
  { fieldName: "City", fieldType: "Text" as const, status: "Active" as StatusLabel, usedInContacts: 4 },
  { fieldName: "Requirement", fieldType: "Text" as const, status: "Active" as StatusLabel, usedInContacts: 4 },
  { fieldName: "Budget", fieldType: "Number" as const, status: "Active" as StatusLabel, usedInContacts: 4 },
  {
    fieldName: "Customer Type",
    fieldType: "Dropdown" as const,
    dropdownOptions: ["Lead", "Existing Customer", "VIP"],
    status: "Active" as StatusLabel,
    usedInContacts: 4,
  },
  { fieldName: "Appointment Date", fieldType: "Date" as const, status: "Active" as StatusLabel, usedInContacts: 2 },
];

export const mockCannedReplies: MockCannedReply[] = [
  {
    title: "Greeting",
    shortcut: "/hi",
    label: "Greeting response",
    category: "General",
    message: "Hi, thanks for reaching out. How can I help you today?",
    status: "Active",
  },
  {
    title: "Pricing Response",
    shortcut: "/price",
    label: "Pricing response",
    category: "Sales",
    message: "Our team can help with pricing. Could you share which plan or service you are interested in?",
    status: "Active",
  },
  {
    title: "Business Hours",
    shortcut: "/hours",
    label: "Business hours response",
    category: "Support",
    message: "Our business hours are Monday to Friday, 10:00 AM to 6:00 PM.",
    status: "Active",
  },
  {
    title: "Location",
    shortcut: "/location",
    label: "Location response",
    category: "Appointment",
    message: "You can find our office location details here. Please let us know if you need directions.",
    status: "Disabled",
  },
  {
    title: "Support Response",
    shortcut: "/support",
    label: "Support response",
    category: "Support",
    message: "I am connecting you with the support team. They will help you with the next steps.",
    status: "Active",
  },
];

export const mockCRMTriggers: MockCRMTrigger[] = [
  { keyword: "price", response: "Sends pricing response", status: "Active", lastUpdated: "Today" },
  { keyword: "hours", response: "Sends business hours response", status: "Active", lastUpdated: "Yesterday" },
  { keyword: "location", response: "Sends location response", status: "Disabled", lastUpdated: "10 May 2026" },
  { keyword: "appointment", response: "Sends appointment confirmation helper response", status: "Active", lastUpdated: "Today" },
  { keyword: "invoice", response: "Sends invoice support response", status: "Active", lastUpdated: "Today" },
];

export const mockMessageStatusTotals = [
  {
    label: "Sent",
    value: "2,840",
    status: "Sent" as StatusLabel,
    description: "Message has been sent from the platform.",
  },
  {
    label: "Delivered",
    value: "2,611",
    status: "Delivered" as StatusLabel,
    description: "Message has reached the customer's WhatsApp.",
  },
  {
    label: "Read",
    value: "2,204",
    status: "Read" as StatusLabel,
    description: "Customer has opened/read the message.",
  },
];

export function getContact(contactId: string) {
  return mockContacts.find((contact) => contact.id === contactId);
}

export function getAgent(agentId?: string) {
  return agentId ? mockAgents.find((agent) => agent.id === agentId) : undefined;
}
