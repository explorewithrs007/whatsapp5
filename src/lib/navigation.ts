import {
  BarChart3,
  BotMessageSquare,
  Building2,
  CreditCard,
  FileText,
  Link2,
  MessageCircle,
  MessagesSquare,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
  UserRound,
  UsersRound,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navigationGroups: NavGroup[] = [
  {
    label: "Dashboard",
    items: [{ label: "Dashboard", path: "dashboard", icon: BarChart3 }],
  },
  {
    label: "Channels",
    items: [
      { label: "WhatsApp Inbox", path: "whatsapp-inbox", icon: MessagesSquare },
      { label: "WhatsApp", path: "whatsapp", icon: BotMessageSquare },
    ],
  },
  {
    label: "CRM",
    items: [
      { label: "Live Chat", path: "live-chat", icon: MessageCircle },
      { label: "Contact", path: "contact", icon: UserRound },
      { label: "Custom Field", path: "custom-field", icon: SlidersHorizontal },
      { label: "Canned Replies", path: "canned-replies", icon: FileText },
      { label: "CRM Triggers", path: "crm-triggers", icon: Workflow },
    ],
  },
  {
    label: "Workspace & Settings",
    items: [
      { label: "Account Settings", path: "account-settings", icon: Settings },
      { label: "Billing", path: "billing", icon: CreditCard },
      { label: "Roles & Permissions", path: "roles-permissions", icon: ShieldCheck },
      { label: "Manage Team", path: "manage-team", icon: UsersRound },
      { label: "Visitors & Conversion", path: "visitors-conversion", icon: Building2 },
      { label: "Links & Alias", path: "links-alias", icon: Link2 },
      { label: "Support Ticket", path: "support-ticket", icon: Ticket },
    ],
  },
];
