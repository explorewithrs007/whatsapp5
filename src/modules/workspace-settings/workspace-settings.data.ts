import { mockAgents, mockContacts, mockConversations, getAgent, getContact } from "@/data/mock-data";

export type WorkspaceProfile = {
  fullName: string;
  email: string;
  initials: string;
};

export type BusinessInformation = {
  companyName: string;
  address: string;
  industry: string;
  initials: string;
};

export type InvoiceRecord = {
  invoiceNumber: string;
  invoiceDate: string;
  amount: string;
  status: "Paid" | "Pending" | "Overdue";
};

export type TeamMemberRecord = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "Admin" | "Agent";
  status: string;
  workload: string;
};

export type LeadRecord = {
  id: string;
  contact: string;
  phone: string;
  source: "Click-to-Chat Link" | "QR" | "Organic";
  firstMessage: string;
  assignedAgent: string;
  leadStatus: "New Lead" | "Contacted" | "Qualified" | "Customer" | "Lost";
  createdAt: string;
};

export type LinkAliasRecord = {
  id: string;
  linkName: string;
  type: "Click-to-Chat Link" | "Short Link" | "Custom Alias";
  whatsappNumber: string;
  prefilledMessage: string;
  shortLink: string;
  customAlias: string;
  conversations: number;
};

export const workspaceProfile: WorkspaceProfile = {
  fullName: "Meera Shah",
  email: "meera.shah@pixelotech.example",
  initials: "MS",
};

export const businessInformation: BusinessInformation = {
  companyName: "Pixelotech Support",
  address: "Alpha Studio, Mumbai, Maharashtra",
  industry: "Customer Support",
  initials: "PS",
};

export const planDetails = {
  currentPlan: "Standard Plan",
  subscriptionStatus: "Active",
  billingCycle: "Monthly",
  usersLimit: "10 workspace users",
  billingModel: "Flat Subscription",
};

export const invoices: InvoiceRecord[] = [
  { invoiceNumber: "INV-2026-005", invoiceDate: "May 1, 2026", amount: "INR 18,000", status: "Paid" },
  { invoiceNumber: "INV-2026-004", invoiceDate: "Apr 1, 2026", amount: "INR 18,000", status: "Paid" },
  { invoiceNumber: "INV-2026-003", invoiceDate: "Mar 1, 2026", amount: "INR 18,000", status: "Overdue" },
];

export const roleDefinitions = [
  {
    role: "Admin",
    permissions: [
      "Can manage workspace settings",
      "Can manage WhatsApp connection",
      "Can manage team",
      "Can manage billing",
      "Can view all conversations",
    ],
  },
  {
    role: "Agent",
    permissions: [
      "Can view inbox",
      "Can reply to chats",
      "Can use canned replies",
      "Can view contact profile",
      "Can add internal notes where allowed",
    ],
  },
];

export const accessControlRows = [
  ["Dashboard", "Allowed", "Allowed"],
  ["WhatsApp Inbox", "Allowed", "Allowed"],
  ["WhatsApp", "Allowed", "Limited"],
  ["Live Chat", "Allowed", "Allowed"],
  ["Contact", "Allowed", "Allowed"],
  ["Custom Field", "Allowed", "Limited"],
  ["Canned Replies", "Allowed", "Allowed"],
  ["CRM Triggers", "Allowed", "Limited"],
  ["Account Settings", "Allowed", "Limited"],
  ["Billing", "Allowed", "Not Allowed"],
  ["Roles & Permissions", "Allowed", "Not Allowed"],
  ["Manage Team", "Allowed", "Not Allowed"],
  ["Visitors & Conversion", "Allowed", "Limited"],
  ["Links & Alias", "Allowed", "Limited"],
  ["Support Ticket", "Allowed", "Allowed"],
].map(([feature, admin, agent]) => ({ feature, admin, agent }));

export const teamMembers: TeamMemberRecord[] = mockAgents.map((agent, index) => ({
  id: agent.id,
  name: agent.name,
  email: `${agent.name.toLowerCase().replace(/\s+/g, ".")}@pixelotech.example`,
  initials: agent.initials,
  role: index === 0 ? "Admin" : "Agent",
  status: agent.status,
  workload: `${mockConversations.filter((conversation) => conversation.assignedAgentId === agent.id).length} active chats`,
}));

export const leads: LeadRecord[] = mockConversations.map((conversation, index) => {
  const contact = getContact(conversation.contactId);
  const agent = getAgent(conversation.assignedAgentId);
  const statuses: LeadRecord["leadStatus"][] = ["New Lead", "Contacted", "Qualified", "Customer"];
  const sources: LeadRecord["source"][] = ["Click-to-Chat Link", "QR", "Organic", "Click-to-Chat Link"];

  return {
    id: conversation.id,
    contact: contact?.name ?? "Unknown Contact",
    phone: contact?.phone ?? "-",
    source: sources[index] ?? "Organic",
    firstMessage: conversation.lastMessage,
    assignedAgent: agent?.name ?? "Unassigned",
    leadStatus: statuses[index] ?? "New Lead",
    createdAt: conversation.lastActivityAt,
  };
});

export const linkAliases: LinkAliasRecord[] = [
  {
    id: "link-appointment",
    linkName: "Appointment Confirmation",
    type: "Click-to-Chat Link",
    whatsappNumber: "+91 98765 43210",
    prefilledMessage: "Hi, I want to confirm my appointment.",
    shortLink: "wa.link/appoint",
    customAlias: "appointment",
    conversations: 18,
  },
  {
    id: "link-invoice",
    linkName: "Invoice Support",
    type: "Short Link",
    whatsappNumber: "+91 99887 77665",
    prefilledMessage: "Hi, I need help with my invoice.",
    shortLink: "wa.link/invoice",
    customAlias: "invoice-help",
    conversations: 11,
  },
  {
    id: "link-product",
    linkName: "Product Questions",
    type: "Custom Alias",
    whatsappNumber: "+91 90000 11223",
    prefilledMessage: "Hi, I have a product question.",
    shortLink: "wa.link/product",
    customAlias: "product-help",
    conversations: 9,
  },
];
