import { getAllSiteSettings } from "@/lib/actions/settings";
import AdminSettingsClient, { type SiteSettings } from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const settings = await getAllSiteSettings();

  const initialSettings: SiteSettings = {
    general: settings.general as SiteSettings["general"],
    social: settings.social as SiteSettings["social"],
    commerce: settings.commerce as SiteSettings["commerce"],
    footer: settings.footer as SiteSettings["footer"],
  };

  return <AdminSettingsClient initialSettings={initialSettings} />;
}
