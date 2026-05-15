import type { ReactNode } from "react";
import { useState } from "react";
import { AppShell } from "@/layout/AppShell";
import { WhatsAppInboxPage } from "@/modules/channels/WhatsAppInboxPage";
import { WhatsAppPage } from "@/modules/channels/WhatsAppPage";
import { CannedRepliesPage } from "@/modules/crm/CannedRepliesPage";
import { ContactPage } from "@/modules/crm/ContactPage";
import { CRMTriggersPage } from "@/modules/crm/CRMTriggersPage";
import { CustomFieldPage } from "@/modules/crm/CustomFieldPage";
import { LiveChatPage } from "@/modules/crm/LiveChatPage";
import { DashboardPage } from "@/modules/dashboard/DashboardPage";
import { AccountSettingsPage } from "@/modules/workspace-settings/AccountSettingsPage";
import { BillingPage } from "@/modules/workspace-settings/BillingPage";
import { LinksAliasPage } from "@/modules/workspace-settings/LinksAliasPage";
import { ManageTeamPage } from "@/modules/workspace-settings/ManageTeamPage";
import { RolesPermissionsPage } from "@/modules/workspace-settings/RolesPermissionsPage";
import { SupportTicketPage } from "@/modules/workspace-settings/SupportTicketPage";
import { VisitorsConversionPage } from "@/modules/workspace-settings/VisitorsConversionPage";

function getWhatsAppTabFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const queryTab = params.get("tab");
  const hashTab = window.location.hash.replace("#", "");

  return queryTab || hashTab || null;
}

type PagePath =
  | "dashboard"
  | "whatsapp-inbox"
  | "whatsapp"
  | "live-chat"
  | "contact"
  | "custom-field"
  | "canned-replies"
  | "crm-triggers"
  | "account-settings"
  | "billing"
  | "roles-permissions"
  | "manage-team"
  | "visitors-conversion"
  | "links-alias"
  | "support-ticket";

export default function App() {
  const initialWhatsAppTab = getWhatsAppTabFromLocation();
  const [activePath, setActivePath] = useState<PagePath>(initialWhatsAppTab ? "whatsapp" : "dashboard");
  const [whatsappTab, setWhatsappTab] = useState(initialWhatsAppTab ?? "api-connection");

  const handleNavigate = (path: string) => {
    const validPaths: PagePath[] = [
      "dashboard",
      "whatsapp-inbox",
      "whatsapp",
      "live-chat",
      "contact",
      "custom-field",
      "canned-replies",
      "crm-triggers",
      "account-settings",
      "billing",
      "roles-permissions",
      "manage-team",
      "visitors-conversion",
      "links-alias",
      "support-ticket",
    ];

    if (validPaths.includes(path as PagePath)) {
      if (path === "whatsapp") {
        setWhatsappTab(getWhatsAppTabFromLocation() ?? "api-connection");
      }

      setActivePath(path as PagePath);
    }
  };

  const openMessageStatus = () => {
    setWhatsappTab("message-status");
    setActivePath("whatsapp");
    window.history.replaceState(null, "", "?tab=message-status");
  };

  const openCRMTriggers = () => {
    setActivePath("crm-triggers");
    window.history.replaceState(null, "", window.location.pathname);
  };

  const pages: Record<PagePath, ReactNode> = {
    dashboard: <DashboardPage onOpenMessageStatus={openMessageStatus} />,
    "whatsapp-inbox": <WhatsAppInboxPage />,
    whatsapp: <WhatsAppPage activeTab={whatsappTab} onManageCRMTriggers={openCRMTriggers} onTabChange={setWhatsappTab} />,
    "live-chat": <LiveChatPage />,
    contact: <ContactPage />,
    "custom-field": <CustomFieldPage />,
    "canned-replies": <CannedRepliesPage />,
    "crm-triggers": <CRMTriggersPage />,
    "account-settings": <AccountSettingsPage />,
    billing: <BillingPage />,
    "roles-permissions": <RolesPermissionsPage />,
    "manage-team": <ManageTeamPage />,
    "visitors-conversion": <VisitorsConversionPage />,
    "links-alias": <LinksAliasPage />,
    "support-ticket": <SupportTicketPage />,
  };

  return (
    <AppShell activePath={activePath} onNavigate={handleNavigate}>
      {pages[activePath] ?? pages.dashboard}
    </AppShell>
  );
}
