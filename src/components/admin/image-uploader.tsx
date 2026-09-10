"use client";

import { useState, useCallback, useRef, useTransition } from "react";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Upload,
  Trash2,
  Star,
  GripVertical,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,
  reorderImages,
} from "@/lib/actions/images";
import type { ProductImage } from "@/types/database";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploaderProps {
  productId: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

function SortableImage({
  image,
  onDelete,
  onSetPrimary,
  isDeleting,
}: {
  image: ProductImage;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-lg border border-[#E8E3DD] bg-white overflow-hidden"
    >
      <div className="aspect-square relative">
        {image.url ? (
          <Image
            src={image.url}
            alt={image.alt_text ?? "Product image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#EDEBE9]">
            <ImageIcon className="h-8 w-8 text-[#8A8578]" />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8"
          onClick={() => onSetPrimary(image.id)}
        >
          <Star
            className={`h-4 w-4 ${
              image.is_primary ? "fill-yellow-500 text-yellow-500" : ""
            }`}
          />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8"
          onClick={() => onDelete(image.id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="p-2 text-xs text-muted-foreground truncate border-t border-[#E8E3DD]">
        {image.alt_text ?? "No alt text"}
        {image.is_primary && (
          <Badge className="ml-1 bg-[#121212]/10 text-[#121212] border-[#121212]/20 text-[10px]">
            Primary
          </Badge>
        )}
      </div>
    </div>
  );
}

export function ImageUploader({
  productId,
  images,
  onImagesChange,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsUploading(true);
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB limit`);
          continue;
        }

        try {
          const formData = new FormData();
          formData.append("file", file);
          const newImage = await uploadProductImage(productId, formData);
          onImagesChange([...images, newImage]);
          toast.success(`Uploaded ${file.name}`);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      setIsUploading(false);
    },
    [productId, images, onImagesChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  async function handleDelete(imageId: string) {
    setDeletingId(imageId);
    try {
      await deleteProductImage(imageId, productId);
      onImagesChange(images.filter((img) => img.id !== imageId));
      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
    }
    setDeletingId(null);
  }

  async function handleSetPrimary(imageId: string) {
    startTransition(async () => {
      try {
        await setPrimaryImage(imageId, productId);
        onImagesChange(
          images.map((img) => ({
            ...img,
            is_primary: img.id === imageId,
          }))
        );
      } catch {
        toast.error("Failed to set primary image");
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);
    onImagesChange(reordered);

    startTransition(async () => {
      try {
        await reorderImages(
          productId,
          reordered.map((img) => img.id)
        );
      } catch {
        toast.error("Failed to save image order");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
          isDragOver
            ? "border-[#121212] bg-[#121212]/5"
            : "border-[#E8E3DD] bg-[#EDEBE9] hover:border-[#121212]/40"
        }`}
      >
        <div className="text-center">
          {isUploading ? (
            <Loader2 className="mx-auto h-10 w-10 text-[#8A8578] animate-spin" />
          ) : (
            <Upload className="mx-auto h-10 w-10 text-[#8A8578]" />
          )}
          <p className="mt-3 text-sm font-medium text-[#121212]">
            {isUploading
              ? "Uploading..."
              : "Drag & drop images here, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, WebP up to 10MB each
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">
            Uploaded Images ({images.length})
          </h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {images
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((img) => (
                    <SortableImage
                      key={img.id}
                      image={img}
                      onDelete={handleDelete}
                      onSetPrimary={handleSetPrimary}
                      isDeleting={deletingId === img.id}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {images.length === 0 && !isUploading && (
        <p className="text-center text-sm text-muted-foreground py-6">
          No images uploaded yet. Upload images above.
        </p>
      )}
    </div>
  );
}
