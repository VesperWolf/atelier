"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionList } from "./section-list";
import { SectionEditor } from "./section-editor";
import { BlockPicker } from "./block-picker";
import type { PageSection } from "@/types/database";

interface PageBuilderClientProps {
  initialSections: PageSection[];
}

export function PageBuilderClient({ initialSections }: PageBuilderClientProps) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [blockPickerOpen, setBlockPickerOpen] = useState(false);

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  function refreshData() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
            Page Builder
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage homepage sections with drag-and-drop reordering.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="accent"
            onClick={() => setBlockPickerOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </Button>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2 border-[#E8E3DD]">
              <ExternalLink className="h-4 w-4" />
              Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Main layout: sections list (4/12) | section editor (8/12) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left panel - sections list */}
        <div className="lg:col-span-4">
          <SectionList
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSelect={setSelectedSectionId}
            onReorder={(reordered) => {
              setSections(reordered);
              refreshData();
            }}
            onToggleVisibility={(id, isVisible) => {
              setSections((prev) =>
                prev.map((s) => (s.id === id ? { ...s, is_visible: isVisible } : s))
              );
              refreshData();
            }}
            onDelete={(id) => {
              setSections((prev) => prev.filter((s) => s.id !== id));
              if (selectedSectionId === id) setSelectedSectionId(null);
              refreshData();
            }}
            onAddSection={(section) => {
              setSections((prev) => [...prev, section].sort((a, b) => a.display_order - b.display_order));
              setSelectedSectionId(section.id);
              refreshData();
            }}
          />
        </div>

        {/* Right panel - section editor */}
        <div className="lg:col-span-8">
          <SectionEditor
            section={selectedSection}
            onSave={() => refreshData()}
          />
        </div>
      </div>

      <BlockPicker
        open={blockPickerOpen}
        onOpenChange={setBlockPickerOpen}
        onSelect={(section) => {
          setSections((prev) => [...prev, section].sort((a, b) => a.display_order - b.display_order));
          setSelectedSectionId(section.id);
          setBlockPickerOpen(false);
          refreshData();
        }}
        nextDisplayOrder={
          sections.length > 0
            ? Math.max(...sections.map((s) => s.display_order)) + 1
            : 0
        }
      />
    </div>
  );
}
