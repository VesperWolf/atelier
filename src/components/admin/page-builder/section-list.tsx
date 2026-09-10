"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { reorderSections, toggleSectionVisibility, deleteSection } from "@/lib/actions/page-builder";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

interface SectionListProps {
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelect: (id: string) => void;
  onReorder: (sections: PageSection[]) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  onDelete: (id: string) => void;
  onAddSection?: (section: PageSection) => void;
}

function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDeleteRequest,
}: {
  section: PageSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: (isVisible: boolean) => void;
  onDeleteRequest: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label = section.title || SECTION_TYPE_LABELS[section.section_type] || section.section_type;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-3 cursor-pointer transition-colors border-[#E8E3DD]",
        isSelected ? "ring-2 ring-[#121212] bg-[#EDEBE9]/80" : "hover:bg-[#EDEBE9]/50"
      )}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#E8E3DD]/60 text-muted-foreground hover:text-[#121212]"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#121212] truncate">{label}</p>
        <Badge variant="outline" className="text-[10px] font-normal border-[#E8E3DD]">
          {SECTION_TYPE_LABELS[section.section_type] || section.section_type}
        </Badge>
      </div>
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-[#121212]"
          onClick={() => onToggleVisibility(!section.is_visible)}
          title={section.is_visible ? "Hide section" : "Show section"}
        >
          {section.is_visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onDeleteRequest}
          title="Delete section"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

export function SectionList({
  sections,
  selectedSectionId,
  onSelect,
  onReorder,
  onToggleVisibility,
  onDelete,
}: SectionListProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(sections, oldIndex, newIndex);
    onReorder(reordered);
    startTransition(async () => {
      try {
        await reorderSections(reordered.map((s) => s.id));
        toast.success("Sections reordered");
      } catch (err) {
        toast.error("Failed to reorder sections");
      }
    });
  }

  function handleToggleVisibility(id: string, isVisible: boolean) {
    onToggleVisibility(id, isVisible);
    startTransition(async () => {
      try {
        await toggleSectionVisibility(id, isVisible);
        toast.success(isVisible ? "Section visible" : "Section hidden");
      } catch (err) {
        toast.error("Failed to update visibility");
      }
    });
  }

  function handleConfirmDelete() {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    onDelete(id);
    startTransition(async () => {
      try {
        await deleteSection(id);
        toast.success("Section deleted");
      } catch (err) {
        toast.error("Failed to delete section");
      }
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <>
      <Card className="border-[#E8E3DD] p-4">
        <h3 className="text-sm font-semibold text-[#121212] mb-3">Sections</h3>
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No sections yet. Click &quot;Add Section&quot; to create one.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableSectionItem
                    key={section.id}
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    onSelect={() => onSelect(section.id)}
                    onToggleVisibility={(isVisible) =>
                      handleToggleVisibility(section.id, isVisible)
                    }
                    onDeleteRequest={() => setDeleteConfirmId(section.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>

      <Dialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
        <DialogContent className="border-[#E8E3DD]">
          <DialogHeader>
            <DialogTitle>Delete section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="border-[#E8E3DD]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
