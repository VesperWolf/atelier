"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatPrice, cn } from "@/lib/utils";
import {
  createOptionCategory,
  createOptionValue,
  updateOptionValue,
  deleteOptionValue,
} from "@/lib/actions/options";
import type { OptionCategory, OptionValue } from "@/types/database";
import { toast } from "sonner";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface AdminOptionsClientProps {
  initialCategories: OptionCategory[];
  initialValues: OptionValue[];
}

export default function AdminOptionsClient({
  initialCategories,
  initialValues,
}: AdminOptionsClientProps) {
  const [categories, setCategories] = useState<OptionCategory[]>(initialCategories);
  const [values, setValues] = useState<OptionValue[]>(initialValues);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCategories[0]?.id ?? ""
  );
  const [showValueDialog, setShowValueDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingValue, setEditingValue] = useState<OptionValue | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isPending, startTransition] = useTransition();

  const [valueForm, setValueForm] = useState({
    name: "",
    description: "",
    color_hex: "#000000",
    image_url: "",
    price_modifier: "0",
    price_modifier_type: "fixed",
    is_active: true,
  });

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const categoryValues = values
    .filter((v) => v.category_id === selectedCategoryId)
    .sort((a, b) => a.sort_order - b.sort_order);

  function openAddValue() {
    setEditingValue(null);
    setValueForm({
      name: "",
      description: "",
      color_hex: "#000000",
      image_url: "",
      price_modifier: "0",
      price_modifier_type: "fixed",
      is_active: true,
    });
    setShowValueDialog(true);
  }

  function openEditValue(val: OptionValue) {
    setEditingValue(val);
    setValueForm({
      name: val.name,
      description: val.description ?? "",
      color_hex: val.color_hex ?? "#000000",
      image_url: val.image_url ?? "",
      price_modifier: String(val.price_modifier),
      price_modifier_type: val.price_modifier_type,
      is_active: val.is_active,
    });
    setShowValueDialog(true);
  }

  function handleSaveValue() {
    if (!selectedCategoryId || !valueForm.name) return;
    startTransition(async () => {
      try {
        if (editingValue) {
          const updated = await updateOptionValue(editingValue.id, {
            name: valueForm.name,
            slug: slugify(valueForm.name),
            description: valueForm.description || null,
            color_hex: valueForm.color_hex || null,
            image_url: valueForm.image_url || null,
            price_modifier: Number(valueForm.price_modifier),
            price_modifier_type: valueForm.price_modifier_type,
            is_active: valueForm.is_active,
          });
          setValues((prev) =>
            prev.map((v) => (v.id === editingValue.id ? updated : v))
          );
          toast.success("Option value updated");
        } else {
          const newValue = await createOptionValue({
            category_id: selectedCategoryId,
            name: valueForm.name,
            slug: slugify(valueForm.name),
            description: valueForm.description || null,
            color_hex: valueForm.color_hex || null,
            image_url: valueForm.image_url || null,
            price_modifier: Number(valueForm.price_modifier),
            price_modifier_type: valueForm.price_modifier_type,
            is_active: valueForm.is_active,
            sort_order: categoryValues.length + 1,
          });
          setValues((prev) => [...prev, newValue]);
          toast.success("Option value added");
        }
        setShowValueDialog(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  function handleDeleteValue(valueId: string) {
    startTransition(async () => {
      try {
        await deleteOptionValue(valueId);
        setValues((prev) => prev.filter((v) => v.id !== valueId));
        toast.success("Option value deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete");
      }
    });
  }

  function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    startTransition(async () => {
      try {
        const newCat = (await createOptionCategory({
          name: newCategoryName.trim(),
          slug: slugify(newCategoryName.trim()),
          description: null,
          sort_order: categories.length + 1,
        })) as OptionCategory;
        setCategories((prev) => [...prev, newCat]);
        setSelectedCategoryId(newCat.id);
        setNewCategoryName("");
        setShowCategoryDialog(false);
        toast.success("Category added");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to add category");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
          Options
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage option categories and their values (finishes, fabrics, etc.).
        </p>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left panel - Categories */}
        <div className="lg:col-span-4">
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold font-sans">
                  Categories
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-[#E8E3DD]"
                  onClick={() => setShowCategoryDialog(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#E8E3DD]">
                {categories.map((cat) => {
                  const count = values.filter(
                    (v) => v.category_id === cat.id
                  ).length;
                  const isSelected = cat.id === selectedCategoryId;
                  return (
                    <button
                      key={cat.id}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[#EDEBE9]/60",
                        isSelected && "bg-[#EDEBE9] border-l-2 border-l-[#121212]"
                      )}
                      onClick={() => setSelectedCategoryId(cat.id)}
                    >
                      <div className="flex items-center gap-2.5">
                        <Palette
                          className={cn(
                            "h-4 w-4",
                            isSelected
                              ? "text-[#121212]"
                              : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isSelected
                              ? "text-[#121212]"
                              : "text-muted-foreground"
                          )}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-[#EDEBE9] text-muted-foreground"
                      >
                        {count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right panel - Values */}
        <div className="lg:col-span-8">
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold font-sans">
                    {selectedCategory?.name ?? "Select a Category"}
                  </CardTitle>
                  {selectedCategory?.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedCategory.description}
                    </p>
                  )}
                </div>
                {selectedCategory && (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-[#121212] hover:bg-[#121212]/90"
                    onClick={openAddValue}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Value
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {categoryValues.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-12">Swatch</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">
                        Price Modifier
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryValues.map((val) => (
                      <TableRow key={val.id}>
                        <TableCell>
                          {val.color_hex ? (
                            <div
                              className="h-8 w-8 rounded-lg border border-gray-200 shadow-sm"
                              style={{ backgroundColor: val.color_hex }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-lg border border-gray-200 bg-[#EDEBE9]" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {val.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                          {val.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {val.price_modifier > 0 ? (
                            <span className="font-medium">
                              +{formatPrice(val.price_modifier)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              val.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-50"
                            }
                          >
                            {val.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditValue(val)}
                              disabled={isPending}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteValue(val.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <Palette className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory
                      ? "No values defined for this category yet."
                      : "Select a category to view its values."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Value Dialog */}
      <Dialog open={showValueDialog} onOpenChange={setShowValueDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingValue ? "Edit Option Value" : "Add Option Value"}
            </DialogTitle>
            <DialogDescription>
              {editingValue
                ? `Editing ${editingValue.name}`
                : `Add a new value to ${selectedCategory?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={valueForm.name}
                onChange={(e) =>
                  setValueForm({ ...valueForm, name: e.target.value })
                }
                placeholder="Option value name"
                className="border-[#E8E3DD]"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={valueForm.description}
                onChange={(e) =>
                  setValueForm({ ...valueForm, description: e.target.value })
                }
                placeholder="Brief description"
                className="border-[#E8E3DD]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={valueForm.color_hex}
                    onChange={(e) =>
                      setValueForm({ ...valueForm, color_hex: e.target.value })
                    }
                    className="h-10 w-12 cursor-pointer rounded-md border border-[#E8E3DD]"
                  />
                  <Input
                    value={valueForm.color_hex}
                    onChange={(e) =>
                      setValueForm({ ...valueForm, color_hex: e.target.value })
                    }
                    className="border-[#E8E3DD] font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={valueForm.image_url}
                  onChange={(e) =>
                    setValueForm({ ...valueForm, image_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="border-[#E8E3DD]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price Modifier ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valueForm.price_modifier}
                  onChange={(e) =>
                    setValueForm({
                      ...valueForm,
                      price_modifier: e.target.value,
                    })
                  }
                  className="border-[#E8E3DD]"
                />
              </div>
              <div className="space-y-2">
                <Label>Modifier Type</Label>
                <Select
                  value={valueForm.price_modifier_type}
                  onValueChange={(val) =>
                    setValueForm({ ...valueForm, price_modifier_type: val })
                  }
                >
                  <SelectTrigger className="border-[#E8E3DD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label>Active</Label>
              <Switch
                checked={valueForm.is_active}
                onCheckedChange={(checked) =>
                  setValueForm({ ...valueForm, is_active: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowValueDialog(false)}
              className="border-[#E8E3DD]"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveValue}
              className="bg-[#121212] hover:bg-[#121212]/90"
              disabled={!valueForm.name || isPending}
            >
              {editingValue ? "Save Changes" : "Add Value"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Option Category</DialogTitle>
            <DialogDescription>
              Create a new option category like &ldquo;Powder Coat Finish&rdquo;
              or &ldquo;Fabric&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Cushion Material"
                className="border-[#E8E3DD]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
              className="border-[#E8E3DD]"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              className="bg-[#121212] hover:bg-[#121212]/90"
              disabled={!newCategoryName.trim() || isPending}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
