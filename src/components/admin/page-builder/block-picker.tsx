"use client";

import { useTransition } from "react";
import { LayoutGrid } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createSection } from "@/lib/actions/page-builder";
import { toast } from "sonner";
import type { PageSection } from "@/types/database";

const BLOCK_TYPES: {
  type: string;
  label: string;
  defaultContent: Record<string, unknown>;
}[] = [
  {
    type: "hero",
    label: "Hero",
    defaultContent: {
      heading: "",
      subheading: "",
      image_url: "",
      cta_text: "",
      cta_link: "",
    },
  },
  {
    type: "heritage",
    label: "Heritage",
    defaultContent: { heading: "", description: "" },
  },
  {
    type: "lattice_showcase",
    label: "Lattice Showcase",
    defaultContent: { heading: "" },
  },
  {
    type: "craftsmanship",
    label: "Craftsmanship",
    defaultContent: { heading: "", description: "" },
  },
  {
    type: "materials",
    label: "Materials",
    defaultContent: { heading: "", description: "" },
  },
  {
    type: "product_grid",
    label: "Product Grid",
    defaultContent: {
      heading: "",
      show_prices: true,
      columns: 3,
      featured_only: false,
    },
  },
  {
    type: "featured_products",
    label: "Featured Products",
    defaultContent: { heading: "", product_ids: "" },
  },
  {
    type: "text_block",
    label: "Text Block",
    defaultContent: { heading: "", body: "", alignment: "left" },
  },
  {
    type: "cta",
    label: "CTA",
    defaultContent: {
      heading: "",
      description: "",
      button_text: "",
      button_link: "",
    },
  },
];

interface BlockPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (section: PageSection) => void;
  nextDisplayOrder?: number;
}

export function BlockPicker({
  open,
  onOpenChange,
  onSelect,
  nextDisplayOrder = 0,
}: BlockPickerProps) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(blockType: (typeof BLOCK_TYPES)[number]) {
    startTransition(async () => {
      try {
        const section = await createSection({
          page_slug: "homepage",
          section_type: blockType.type,
          title: null,
          content: blockType.defaultContent,
          display_order: nextDisplayOrder,
          is_visible: true,
        });
        onSelect(section);
        onOpenChange(false);
        toast.success(`${blockType.label} section added`);
      } catch (err) {
        toast.error("Failed to add section");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#E8E3DD] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Add Section
          </DialogTitle>
          <DialogDescription>
            Choose a block type to add to your homepage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
          {BLOCK_TYPES.map((block) => (
            <Button
              key={block.type}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-1 border-[#E8E3DD] hover:bg-[#EDEBE9] hover:border-[#121212]/30"
              onClick={() => handleSelect(block)}
              disabled={isPending}
            >
              <LayoutGrid className="h-5 w-5 text-[#121212]" />
              <span className="text-sm font-medium">{block.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
