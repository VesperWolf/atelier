"use client";

import { useState, useTransition, useEffect } from "react";
import { Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateSection } from "@/lib/actions/page-builder";
import { toast } from "sonner";
import type { PageSection } from "@/types/database";

const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: "Hero",
  heritage: "Heritage",
  lattice_showcase: "Lattice Showcase",
  craftsmanship: "Craftsmanship",
  materials: "Materials",
  product_grid: "Product Grid",
  featured_products: "Featured Products",
  text_block: "Text Block",
  cta: "CTA",
};

interface SectionEditorProps {
  section: PageSection | null | undefined;
  onSave: () => void;
}

function getContentValue(content: Record<string, unknown>, key: string): string {
  const v = content[key];
  if (v === null || v === undefined) return "";
  return String(v);
}

function getContentBool(content: Record<string, unknown>, key: string): boolean {
  const v = content[key];
  return v === true || v === "true" || v === 1;
}

function getContentNum(content: Record<string, unknown>, key: string): number {
  const v = content[key];
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseInt(v, 10) || 2;
  return 2;
}

export function SectionEditor({ section, onSave }: SectionEditorProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(
    section?.content ?? {}
  );
  const [title, setTitle] = useState(section?.title ?? "");

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (section) {
      setFormData(section.content ?? {});
      setTitle(section.title ?? "");
    }
  }, [section?.id]);

  function updateField(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!section) return;
    startTransition(async () => {
      try {
        await updateSection(section.id, {
          title: title || null,
          content: formData,
        });
        toast.success("Changes saved");
        onSave();
      } catch (err) {
        toast.error("Failed to save changes");
      }
    });
  }

  if (!section) {
    return (
      <Card className="border-[#E8E3DD]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center">
            Select a section from the list to edit its content.
          </p>
        </CardContent>
      </Card>
    );
  }

  const typeLabel = SECTION_TYPE_LABELS[section.section_type] ?? section.section_type;

  return (
    <Card className="border-[#E8E3DD]">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Section: {typeLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Section title (admin)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Homepage Hero"
              className="border-[#E8E3DD]"
            />
          </div>

          {/* Type-specific fields */}
          {section.section_type === "hero" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="heading">Heading</Label>
                <Input
                  id="heading"
                  value={getContentValue(formData, "heading")}
                  onChange={(e) => updateField("heading", e.target.value)}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subheading">Subheading</Label>
                <Input
                  id="subheading"
                  value={getContentValue(formData, "subheading")}
                  onChange={(e) => updateField("subheading", e.target.value)}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={getContentValue(formData, "image_url")}
                  onChange={(e) => updateField("image_url", e.target.value)}
                  placeholder="https://..."
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_text">CTA Text</Label>
                  <Input
                    id="cta_text"
                    value={getContentValue(formData, "cta_text")}
                    onChange={(e) => updateField("cta_text", e.target.value)}
                    className="border-[#E8E3DD]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta_link">CTA Link</Label>
                  <Input
                    id="cta_link"
                    value={getContentValue(formData, "cta_link")}
                    onChange={(e) => updateField("cta_link", e.target.value)}
                    placeholder="/products"
                    className="border-[#E8E3DD]"
                  />
                </div>
              </div>
            </>
          )}

          {(section.section_type === "heritage" ||
            section.section_type === "craftsmanship" ||
            section.section_type === "materials") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="heading">Heading</Label>
                <Input
                  id="heading"
                  value={getContentValue(formData, "heading")}
                  onChange={(e) => updateField("heading", e.target.value)}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={getContentValue(formData, "description")}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  className="border-[#E8E3DD]"
                />
              </div>
            </>
          )}

          {section.section_type === "lattice_showcase" && (
            <div className="space-y-2">
              <Label htmlFor="heading">Heading</Label>
              <Input
                id="heading"
                value={getContentValue(formData, "heading")}
                onChange={(e) => updateField("heading", e.target.value)}
                className="border-[#E8E3DD]"
              />
            </div>
          )}

          {section.section_type === "product_grid" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="heading">Heading</Label>
                <Input
                  id="heading"
                  value={getContentValue(formData, "heading")}
                  onChange={(e) => updateField("heading", e.target.value)}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show_prices">Show prices</Label>
                <Switch
                  id="show_prices"
                  checked={getContentBool(formData, "show_prices")}
                  onCheckedChange={(v) => updateField("show_prices", v)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="columns">Columns</Label>
                <Select
                  value={String(getContentNum(formData, "columns"))}
                  onValueChange={(v) => updateField("columns", parseInt(v, 10))}
                >
                  <SelectTrigger className="border-[#E8E3DD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured_only">Featured only</Label>
                <Switch
                  id="featured_only"
                  checked={getContentBool(formData, "featured_only")}
                  onCheckedChange={(v) => updateField("featured_only", v)}
                />
              </div>
            </>
          )}

          {section.section_type === "featured_products" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="heading">Heading</Label>
                <Input
                  id="heading"
                  value={getContentValue(formData, "heading")}
                  onChange={(e) => updateField("heading", e.target.value)}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_ids">Product IDs (comma-separated)</Label>
                <Input
                  id="product_ids"
                  value={getContentValue(formData, "product_ids")}
                  onChange={(e) => updateField("product_ids", e.target.value)}
                  placeholder="id1, id2, id3"
                  className="border-[#E8E3DD]"
                />
              </div>
            </>
          )}

          {section.section_type === "text_block" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="heading">Heading</Label>
                <Input
                  id="heading"
                  value={getContentValue(formData, "heading")}
                  onChange={(e) => updateField("heading", e.target.value)}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Body</Label>
                <Textarea
                  id="body"
                  value={getContentValue(formData, "body")}
                  onChange={(e) => updateField("body", e.target.value)}
                  rows={5}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alignment">Alignment</Label>
                <Select
                  value={getContentValue(formData, "alignment") || "left"}
                  onValueChange={(v) => updateField("alignment", v)}
                >
                  <SelectTrigger className="border-[#E8E3DD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {section.section_type === "cta" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="heading">Heading</Label>
                <Input
                  id="heading"
                  value={getContentValue(formData, "heading")}
                  onChange={(e) => updateField("heading", e.target.value)}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={getContentValue(formData, "description")}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="button_text">Button text</Label>
                  <Input
                    id="button_text"
                    value={getContentValue(formData, "button_text")}
                    onChange={(e) => updateField("button_text", e.target.value)}
                    className="border-[#E8E3DD]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="button_link">Button link</Label>
                  <Input
                    id="button_link"
                    value={getContentValue(formData, "button_link")}
                    onChange={(e) => updateField("button_link", e.target.value)}
                    placeholder="/consultation"
                    className="border-[#E8E3DD]"
                  />
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="accent"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
