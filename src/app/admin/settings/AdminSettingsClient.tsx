"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { upsertSiteSetting } from "@/lib/actions/settings";
import { Globe, Share2, ShoppingCart, FileText } from "lucide-react";

export type GeneralSettings = {
  site_name: string;
  site_tagline: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
};

export type SocialSettings = {
  instagram_url: string;
  facebook_url: string;
  pinterest_url: string;
  linkedin_url: string;
};

export type CommerceSettings = {
  default_tax_rate: number;
  default_lead_time_days: number;
  shipping_notice: string;
  currency: string;
};

export type FooterSettings = {
  footer_tagline: string;
  footer_copyright: string;
};

export type SiteSettings = {
  general?: Partial<GeneralSettings>;
  social?: Partial<SocialSettings>;
  commerce?: Partial<CommerceSettings>;
  footer?: Partial<FooterSettings>;
};

const DEFAULT_GENERAL: GeneralSettings = {
  site_name: "Atelier Artizan",
  site_tagline: "Engineered for the Elements, Built to Last Generations",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
};

const DEFAULT_SOCIAL: SocialSettings = {
  instagram_url: "",
  facebook_url: "",
  pinterest_url: "",
  linkedin_url: "",
};

const DEFAULT_COMMERCE: CommerceSettings = {
  default_tax_rate: 8,
  default_lead_time_days: 56,
  shipping_notice: "",
  currency: "USD",
};

const DEFAULT_FOOTER: FooterSettings = {
  footer_tagline: "",
  footer_copyright: "",
};

function mergeWithDefaults<T extends Record<string, unknown>>(
  defaults: T,
  overrides?: Partial<T>
): T {
  return { ...defaults, ...overrides } as T;
}

type Props = {
  initialSettings: SiteSettings;
};

export default function AdminSettingsClient({ initialSettings }: Props) {
  const [isGeneralSaving, startGeneralSave] = useTransition();
  const [isSocialSaving, startSocialSave] = useTransition();
  const [isCommerceSaving, startCommerceSave] = useTransition();
  const [isFooterSaving, startFooterSave] = useTransition();

  const general = mergeWithDefaults(DEFAULT_GENERAL, initialSettings.general);
  const social = mergeWithDefaults(DEFAULT_SOCIAL, initialSettings.social);
  const commerce = mergeWithDefaults(DEFAULT_COMMERCE, initialSettings.commerce);
  const footer = mergeWithDefaults(DEFAULT_FOOTER, initialSettings.footer);

  function handleGeneralSave(formData: FormData) {
    startGeneralSave(async () => {
      try {
        await upsertSiteSetting("general", {
          site_name: (formData.get("site_name") as string) ?? general.site_name,
          site_tagline:
            (formData.get("site_tagline") as string) ?? general.site_tagline,
          contact_email:
            (formData.get("contact_email") as string) ?? general.contact_email,
          contact_phone:
            (formData.get("contact_phone") as string) ?? general.contact_phone,
          contact_address:
            (formData.get("contact_address") as string) ??
            general.contact_address,
        });
        toast.success("General settings saved");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save settings"
        );
      }
    });
  }

  function handleSocialSave(formData: FormData) {
    startSocialSave(async () => {
      try {
        await upsertSiteSetting("social", {
          instagram_url:
            (formData.get("instagram_url") as string) ?? social.instagram_url,
          facebook_url:
            (formData.get("facebook_url") as string) ?? social.facebook_url,
          pinterest_url:
            (formData.get("pinterest_url") as string) ?? social.pinterest_url,
          linkedin_url:
            (formData.get("linkedin_url") as string) ?? social.linkedin_url,
        });
        toast.success("Social media settings saved");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save settings"
        );
      }
    });
  }

  function handleCommerceSave(formData: FormData) {
    startCommerceSave(async () => {
      try {
        const taxRate = formData.get("default_tax_rate");
        const leadTime = formData.get("default_lead_time_days");
        await upsertSiteSetting("commerce", {
          default_tax_rate: taxRate
            ? parseFloat(String(taxRate))
            : commerce.default_tax_rate,
          default_lead_time_days: leadTime
            ? parseInt(String(leadTime), 10)
            : commerce.default_lead_time_days,
          shipping_notice:
            (formData.get("shipping_notice") as string) ??
            commerce.shipping_notice,
          currency:
            (formData.get("currency") as string) ?? commerce.currency,
        });
        toast.success("Commerce settings saved");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save settings"
        );
      }
    });
  }

  function handleFooterSave(formData: FormData) {
    startFooterSave(async () => {
      try {
        await upsertSiteSetting("footer", {
          footer_tagline:
            (formData.get("footer_tagline") as string) ?? footer.footer_tagline,
          footer_copyright:
            (formData.get("footer_copyright") as string) ??
            footer.footer_copyright,
        });
        toast.success("Footer settings saved");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to save settings"
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
          Site Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage site-wide configuration for your storefront.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-[#EDEBE9] border border-[#E8E3DD] p-1 gap-1">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-white data-[state=active]:text-[#121212] data-[state=active]:border data-[state=active]:border-[#E8E3DD]"
          >
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="social"
            className="data-[state=active]:bg-white data-[state=active]:text-[#121212] data-[state=active]:border data-[state=active]:border-[#E8E3DD]"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Social Media
          </TabsTrigger>
          <TabsTrigger
            value="commerce"
            className="data-[state=active]:bg-white data-[state=active]:text-[#121212] data-[state=active]:border data-[state=active]:border-[#E8E3DD]"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Commerce
          </TabsTrigger>
          <TabsTrigger
            value="footer"
            className="data-[state=active]:bg-white data-[state=active]:text-[#121212] data-[state=active]:border data-[state=active]:border-[#E8E3DD]"
          >
            <FileText className="h-4 w-4 mr-2" />
            Footer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <CardTitle className="text-base font-semibold font-sans">
                General Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Site identity and contact information
              </p>
            </CardHeader>
            <CardContent>
              <form
                action={handleGeneralSave}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    name="site_name"
                    defaultValue={general.site_name}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="Atelier Artizan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_tagline">Site Tagline</Label>
                  <Input
                    id="site_tagline"
                    name="site_tagline"
                    defaultValue={general.site_tagline}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="Engineered for the Elements, Built to Last Generations"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    defaultValue={general.contact_email}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="hello@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    defaultValue={general.contact_phone}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_address">Contact Address</Label>
                  <Textarea
                    id="contact_address"
                    name="contact_address"
                    defaultValue={general.contact_address}
                    className="border-[#E8E3DD] bg-white min-h-[80px]"
                    placeholder="Full mailing address"
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  disabled={isGeneralSaving}
                  className="bg-[#121212] hover:bg-[#121212]/90"
                >
                  {isGeneralSaving ? "Saving..." : "Save General"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <CardTitle className="text-base font-semibold font-sans">
                Social Media
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Social profile URLs displayed on your site
              </p>
            </CardHeader>
            <CardContent>
              <form
                action={handleSocialSave}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    name="instagram_url"
                    type="url"
                    defaultValue={social.instagram_url}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <Input
                    id="facebook_url"
                    name="facebook_url"
                    type="url"
                    defaultValue={social.facebook_url}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinterest_url">Pinterest URL</Label>
                  <Input
                    id="pinterest_url"
                    name="pinterest_url"
                    type="url"
                    defaultValue={social.pinterest_url}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="https://pinterest.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="url"
                    defaultValue={social.linkedin_url}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="https://linkedin.com/..."
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  disabled={isSocialSaving}
                  className="bg-[#121212] hover:bg-[#121212]/90"
                >
                  {isSocialSaving ? "Saving..." : "Save Social Media"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commerce">
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <CardTitle className="text-base font-semibold font-sans">
                Commerce
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Defaults for orders, tax, and shipping
              </p>
            </CardHeader>
            <CardContent>
              <form
                action={handleCommerceSave}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
                    <Input
                      id="default_tax_rate"
                      name="default_tax_rate"
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      defaultValue={commerce.default_tax_rate}
                      className="border-[#E8E3DD] bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_lead_time_days">
                      Default Lead Time (days)
                    </Label>
                    <Input
                      id="default_lead_time_days"
                      name="default_lead_time_days"
                      type="number"
                      min={0}
                      defaultValue={commerce.default_lead_time_days}
                      className="border-[#E8E3DD] bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    name="currency"
                    defaultValue={commerce.currency}
                    className="border-[#E8E3DD] bg-white max-w-[120px]"
                    placeholder="USD"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_notice">Shipping Notice</Label>
                  <Textarea
                    id="shipping_notice"
                    name="shipping_notice"
                    defaultValue={commerce.shipping_notice}
                    className="border-[#E8E3DD] bg-white min-h-[80px]"
                    placeholder="Custom message shown during checkout (e.g., lead times, shipping policies)"
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  disabled={isCommerceSaving}
                  className="bg-[#121212] hover:bg-[#121212]/90"
                >
                  {isCommerceSaving ? "Saving..." : "Save Commerce"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <CardTitle className="text-base font-semibold font-sans">
                Footer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Text displayed in the site footer
              </p>
            </CardHeader>
            <CardContent>
              <form
                action={handleFooterSave}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="footer_tagline">Footer Tagline</Label>
                  <Input
                    id="footer_tagline"
                    name="footer_tagline"
                    defaultValue={footer.footer_tagline}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="Short tagline for footer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer_copyright">Footer Copyright</Label>
                  <Input
                    id="footer_copyright"
                    name="footer_copyright"
                    defaultValue={footer.footer_copyright}
                    className="border-[#E8E3DD] bg-white"
                    placeholder="© 2025 Atelier Artizan. All rights reserved."
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  disabled={isFooterSaving}
                  className="bg-[#121212] hover:bg-[#121212]/90"
                >
                  {isFooterSaving ? "Saving..." : "Save Footer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
