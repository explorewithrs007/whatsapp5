import { useState } from "react";
import type { ReactNode } from "react";
import { SectionCard } from "@/components/SectionCard";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { businessInformation, workspaceProfile } from "@/modules/workspace-settings/workspace-settings.data";

export function AccountSettingsPage() {
  const [profile, setProfile] = useState(workspaceProfile);
  const [business, setBusiness] = useState(businessInformation);
  const [profileSaved, setProfileSaved] = useState(false);
  const [businessSaved, setBusinessSaved] = useState(false);

  return (
    <div className="grid w-full gap-4 xl:grid-cols-2">
      <SectionCard>
        <h2 className="text-base font-semibold text-foreground">Profile Management</h2>
        <div className="mt-5 flex items-center gap-3">
          <UserAvatar compact initials={profile.initials} name={profile.fullName} size="lg" />
          <div>
            <p className="text-sm font-semibold text-foreground">{profile.fullName}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          <Field label="Full Name">
            <Input value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
          </Field>
        </div>
        <Button className="mt-5" onClick={() => setProfileSaved(true)}>Save Changes</Button>
        {profileSaved ? <p className="mt-2 text-sm font-medium text-whatsapp-dark">Profile changes saved locally.</p> : null}
      </SectionCard>

      <SectionCard>
        <h2 className="text-base font-semibold text-foreground">Business Information</h2>
        <div className="mt-5 flex items-center gap-3">
          <UserAvatar compact initials={business.initials} name={business.companyName} size="lg" />
          <div>
            <p className="text-sm font-semibold text-foreground">{business.companyName}</p>
            <p className="text-sm text-muted-foreground">{business.industry}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          <Field label="Company Name">
            <Input value={business.companyName} onChange={(event) => setBusiness({ ...business, companyName: event.target.value })} />
          </Field>
          <Field label="Address">
            <Input value={business.address} onChange={(event) => setBusiness({ ...business, address: event.target.value })} />
          </Field>
          <Field label="Industry">
            <Input value={business.industry} onChange={(event) => setBusiness({ ...business, industry: event.target.value })} />
          </Field>
        </div>
        <Button className="mt-5" onClick={() => setBusinessSaved(true)}>Save Business Information</Button>
        {businessSaved ? <p className="mt-2 text-sm font-medium text-whatsapp-dark">Business information saved locally.</p> : null}
      </SectionCard>
    </div>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-normal text-muted">{label}</span>
      {children}
    </label>
  );
}
