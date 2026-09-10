"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatPrice } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/image-uploader";
import { createProduct, updateProduct } from "@/lib/actions/products";
import {
  assignOptionCategoryToProduct,
  removeOptionCategoryFromProduct,
} from "@/lib/actions/options";
import { createSku, deleteSku } from "@/lib/actions/skus";
import { toast } from "sonner";
import type {
  Product,
  ProductImage,
  ProductSku,
  Collection,
  LatticeStyle,
  OptionCategory,
  OptionValue,
} from "@/types/database";

interface OptionCategoryWithValues extends OptionCategory {
  values?: OptionValue[];
}

interface ProductWithRelations extends Product {
  images?: ProductImage[];
  skus?: ProductSku[];
}

interface ProductEditorProps {
  productId: string;
  product: ProductWithRelations | null;
  collections: Collection[];
  latticeStyles: LatticeStyle[];
  optionCategories: OptionCategoryWithValues[];
  initialAssignedCategoryIds: string[];
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductEditor({
  productId,
  product,
  collections,
  latticeStyles,
  optionCategories,
  initialAssignedCategoryIds,
}: ProductEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isNew = productId === "new";

  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [skus, setSkus] = useState<ProductSku[]>(product?.skus ?? []);
  const [assignedCategories, setAssignedCategories] = useState(
    initialAssignedCategoryIds
  );
  const [showSkuDialog, setShowSkuDialog] = useState(false);
  const [newSku, setNewSku] = useState({
    sku_code: "",
    name: "",
    price_override: "",
    stock_quantity: "0",
  });

  useEffect(() => {
    setImages(product?.images ?? []);
    setSkus(product?.skus ?? []);
    setAssignedCategories(initialAssignedCategoryIds);
  }, [product?.id, product?.images, product?.skus, initialAssignedCategoryIds]);

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      short_description: product?.short_description ?? "",
      base_price: product?.base_price ?? 0,
      collection_id: product?.collection_id ?? "",
      lattice_style_id: product?.lattice_style_id ?? "",
      category: product?.category ?? "",
      dimensions_width: product?.dimensions_width ?? 0,
      dimensions_depth: product?.dimensions_depth ?? 0,
      dimensions_height: product?.dimensions_height ?? 0,
      weight_lbs: product?.weight_lbs ?? 0,
      material_details: product?.material_details ?? "",
      care_instructions: product?.care_instructions ?? "",
      lead_time_days: product?.lead_time_days ?? 14,
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        slug: product.slug,
        description: product.description ?? "",
        short_description: product.short_description ?? "",
        base_price: product.base_price,
        collection_id: product.collection_id,
        lattice_style_id: product.lattice_style_id ?? "",
        category: product.category,
        dimensions_width: product.dimensions_width ?? 0,
        dimensions_depth: product.dimensions_depth ?? 0,
        dimensions_height: product.dimensions_height ?? 0,
        weight_lbs: product.weight_lbs ?? 0,
        material_details: product.material_details ?? "",
        care_instructions: product.care_instructions ?? "",
        lead_time_days: product.lead_time_days,
        is_active: product.is_active,
        is_featured: product.is_featured,
      });
    }
  }, [product?.id, product, reset]);

  const collectionId = watch("collection_id");

  const filteredLatticeStyles = useMemo(() => {
    if (!collectionId) return latticeStyles;
    return latticeStyles.filter((ls) => ls.collection_id === collectionId);
  }, [collectionId, latticeStyles]);

  function onSubmit(data: Record<string, unknown>) {
    startTransition(async () => {
      try {
        const payload = {
          name: String(data.name),
          slug: String(data.slug),
          description: (data.description as string) || null,
          short_description: (data.short_description as string) || null,
          base_price: Number(data.base_price) || 0,
          collection_id: String(data.collection_id) || "",
          lattice_style_id: (data.lattice_style_id as string) || null,
          category: String(data.category) || "",
          dimensions_width: data.dimensions_width
            ? Number(data.dimensions_width)
            : null,
          dimensions_depth: data.dimensions_depth
            ? Number(data.dimensions_depth)
            : null,
          dimensions_height: data.dimensions_height
            ? Number(data.dimensions_height)
            : null,
          dimensions_unit: "in",
          weight_lbs: data.weight_lbs ? Number(data.weight_lbs) : null,
          material_details: (data.material_details as string) || null,
          care_instructions: (data.care_instructions as string) || null,
          lead_time_days: Number(data.lead_time_days) || 14,
          is_active: Boolean(data.is_active),
          is_featured: Boolean(data.is_featured),
          sort_order: 0,
        };

        if (isNew) {
          const created = await createProduct(payload);
          toast.success("Product created");
          router.push(`/admin/products/${created.id}`);
        } else {
          await updateProduct(productId, payload);
          toast.success("Product saved");
          router.refresh();
        }
      } catch {
        toast.error(
          isNew ? "Failed to create product" : "Failed to save product"
        );
      }
    });
  }

  function handleAddSku() {
    if (!productId || isNew) return;

    startTransition(async () => {
      try {
        const skuData = {
          product_id: productId,
          sku_code: newSku.sku_code,
          name: newSku.name,
          price_override: newSku.price_override
            ? Number(newSku.price_override)
            : null,
          stock_quantity: Number(newSku.stock_quantity) || 0,
          is_active: true,
        };
        const created = await createSku(skuData);
        setSkus([...skus, created]);
        setNewSku({
          sku_code: "",
          name: "",
          price_override: "",
          stock_quantity: "0",
        });
        setShowSkuDialog(false);
        toast.success("SKU added");
        router.refresh();
      } catch {
        toast.error("Failed to add SKU");
      }
    });
  }

  function handleRemoveSku(skuId: string) {
    if (!productId || isNew) return;

    startTransition(async () => {
      try {
        await deleteSku(skuId, productId);
        setSkus(skus.filter((s) => s.id !== skuId));
        toast.success("SKU removed");
        router.refresh();
      } catch {
        toast.error("Failed to remove SKU");
      }
    });
  }

  async function toggleCategory(categoryId: string) {
    if (!productId || isNew) return;

    const isAssigned = assignedCategories.includes(categoryId);

    startTransition(async () => {
      try {
        if (isAssigned) {
          await removeOptionCategoryFromProduct(productId, categoryId);
          setAssignedCategories((prev) => prev.filter((id) => id !== categoryId));
          toast.success("Option category removed");
        } else {
          await assignOptionCategoryToProduct(productId, categoryId);
          setAssignedCategories((prev) => [...prev, categoryId]);
          toast.success("Option category assigned");
        }
        router.refresh();
      } catch {
        toast.error("Failed to update option category");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
              {isNew ? "New Product" : product?.name ?? "Edit Product"}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isNew ? "Create a new product" : `Editing ${product?.slug}`}
            </p>
          </div>
        </div>
        <Button
          className="gap-2 bg-[#121212] hover:bg-[#121212]/90"
          onClick={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          <Save className="h-4 w-4" />
          Save Product
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-[#EDEBE9]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="skus">SKUs</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-[#E8E3DD]">
              <CardHeader>
                <CardTitle className="text-base font-semibold font-sans">
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Heritage Dining Chair"
                      className="border-[#E8E3DD]"
                      onChange={(e) => {
                        register("name").onChange(e);
                        if (isNew) {
                          setValue("slug", slugify(e.target.value));
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      {...register("slug")}
                      placeholder="heritage-dining-chair"
                      className="border-[#E8E3DD] bg-[#EDEBE9]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    {...register("short_description")}
                    placeholder="Brief product description..."
                    className="border-[#E8E3DD]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Detailed product description..."
                    rows={5}
                    className="border-[#E8E3DD]"
                  />
                </div>

                <Separator className="bg-[#E8E3DD]/60" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Collection</Label>
                    <Select
                      value={watch("collection_id")}
                      onValueChange={(val) => setValue("collection_id", val)}
                    >
                      <SelectTrigger className="border-[#E8E3DD]">
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lattice Style</Label>
                    <Select
                      value={watch("lattice_style_id") ?? ""}
                      onValueChange={(val) => setValue("lattice_style_id", val)}
                    >
                      <SelectTrigger className="border-[#E8E3DD]">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredLatticeStyles.map((ls) => (
                          <SelectItem key={ls.id} value={ls.id}>
                            {ls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={watch("category")}
                      onValueChange={(val) => setValue("category", val)}
                    >
                      <SelectTrigger className="border-[#E8E3DD]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Seating">Seating</SelectItem>
                        <SelectItem value="Tables">Tables</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="bg-[#E8E3DD]/60" />

                <div className="space-y-2">
                  <Label>Dimensions (W x D x H, inches)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      type="number"
                      {...register("dimensions_width", {
                        valueAsNumber: true,
                      })}
                      placeholder="Width"
                      className="border-[#E8E3DD]"
                    />
                    <Input
                      type="number"
                      {...register("dimensions_depth", {
                        valueAsNumber: true,
                      })}
                      placeholder="Depth"
                      className="border-[#E8E3DD]"
                    />
                    <Input
                      type="number"
                      {...register("dimensions_height", {
                        valueAsNumber: true,
                      })}
                      placeholder="Height"
                      className="border-[#E8E3DD]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="weight_lbs">Weight (lbs)</Label>
                    <Input
                      id="weight_lbs"
                      type="number"
                      {...register("weight_lbs", { valueAsNumber: true })}
                      className="border-[#E8E3DD]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead_time_days">Lead Time (days)</Label>
                    <Input
                      id="lead_time_days"
                      type="number"
                      {...register("lead_time_days", { valueAsNumber: true })}
                      className="border-[#E8E3DD]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material_details">Material Details</Label>
                  <Textarea
                    id="material_details"
                    {...register("material_details")}
                    rows={2}
                    className="border-[#E8E3DD]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="care_instructions">Care Instructions</Label>
                  <Textarea
                    id="care_instructions"
                    {...register("care_instructions")}
                    rows={2}
                    className="border-[#E8E3DD]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-[#E8E3DD]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold font-sans">
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Base Price ($)</Label>
                    <Input
                      id="base_price"
                      type="number"
                      step="0.01"
                      {...register("base_price", { valueAsNumber: true })}
                      className="border-[#E8E3DD] text-lg font-semibold"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E8E3DD]">
                <CardHeader>
                  <CardTitle className="text-base font-semibold font-sans">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active</Label>
                    <Switch
                      id="is_active"
                      checked={watch("is_active")}
                      onCheckedChange={(checked) =>
                        setValue("is_active", checked)
                      }
                    />
                  </div>
                  <Separator className="bg-[#E8E3DD]/60" />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured">Featured</Label>
                    <Switch
                      id="is_featured"
                      checked={watch("is_featured")}
                      onCheckedChange={(checked) =>
                        setValue("is_featured", checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images">
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <CardTitle className="text-base font-semibold font-sans">
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isNew ? (
                <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#E8E3DD] bg-[#EDEBE9] p-12">
                  <p className="text-sm text-muted-foreground">
                    Save the product first to upload images.
                  </p>
                </div>
              ) : (
                <ImageUploader
                  productId={productId}
                  images={images}
                  onImagesChange={setImages}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="options">
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold font-sans">
                  Option Categories
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Select which option categories apply to this product.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isNew ? (
                <p className="text-sm text-muted-foreground py-6">
                  Save the product first to assign option categories.
                </p>
              ) : (
                optionCategories.map((cat) => {
                  const isAssigned = assignedCategories.includes(cat.id);
                  const values = cat.values ?? [];
                  return (
                    <div
                      key={cat.id}
                      className={`rounded-lg border p-4 transition-colors ${
                        isAssigned
                          ? "border-[#121212]/40 bg-[#121212]/5"
                          : "border-[#E8E3DD]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{cat.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {cat.description}
                          </p>
                        </div>
                        <Button
                          variant={isAssigned ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCategory(cat.id)}
                          disabled={isPending}
                          className={
                            isAssigned
                              ? "bg-[#121212] hover:bg-[#121212]/90"
                              : "border-[#E8E3DD]"
                          }
                        >
                          {isAssigned ? "Assigned" : "Add"}
                        </Button>
                      </div>
                      {isAssigned && values.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {values.map((val) => (
                            <div
                              key={val.id}
                              className="flex items-center gap-1.5 rounded-full border border-[#E8E3DD] bg-white px-2.5 py-1"
                            >
                              {val.color_hex && (
                                <div
                                  className="h-3 w-3 rounded-full border border-gray-200"
                                  style={{ backgroundColor: val.color_hex }}
                                />
                              )}
                              <span className="text-xs font-medium">
                                {val.name}
                              </span>
                              {val.price_modifier > 0 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{formatPrice(val.price_modifier)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skus">
          <Card className="border-[#E8E3DD]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold font-sans">
                  Product SKUs
                </CardTitle>
                <Button
                  size="sm"
                  className="gap-1.5 bg-[#121212] hover:bg-[#121212]/90"
                  onClick={() => setShowSkuDialog(true)}
                  disabled={isNew}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add SKU
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isNew ? (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  Save the product first to add SKUs.
                </p>
              ) : skus.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>SKU Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">
                        Price Override
                      </TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skus.map((sku) => (
                      <TableRow key={sku.id}>
                        <TableCell className="font-mono text-sm">
                          {sku.sku_code}
                        </TableCell>
                        <TableCell className="text-sm">{sku.name}</TableCell>
                        <TableCell className="text-right text-sm">
                          {sku.price_override
                            ? formatPrice(sku.price_override)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {sku.stock_quantity}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              sku.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-50"
                            }
                          >
                            {sku.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveSku(sku.id)}
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    No SKUs defined yet. Add a SKU to create purchasable
                    variants.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showSkuDialog} onOpenChange={setShowSkuDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New SKU</DialogTitle>
                <DialogDescription>
                  Create a new stock keeping unit for this product.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="sku_code">SKU Code</Label>
                  <Input
                    id="sku_code"
                    value={newSku.sku_code}
                    onChange={(e) =>
                      setNewSku({ ...newSku, sku_code: e.target.value })
                    }
                    placeholder="HDC-BLK-NAT"
                    className="border-[#E8E3DD]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku_name">Name</Label>
                  <Input
                    id="sku_name"
                    value={newSku.name}
                    onChange={(e) =>
                      setNewSku({ ...newSku, name: e.target.value })
                    }
                    placeholder="Obsidian Black / Canvas Natural"
                    className="border-[#E8E3DD]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_override">Price Override ($)</Label>
                    <Input
                      id="price_override"
                      type="number"
                      step="0.01"
                      value={newSku.price_override}
                      onChange={(e) =>
                        setNewSku({
                          ...newSku,
                          price_override: e.target.value,
                        })
                      }
                      placeholder="Leave blank for base price"
                      className="border-[#E8E3DD]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={newSku.stock_quantity}
                      onChange={(e) =>
                        setNewSku({
                          ...newSku,
                          stock_quantity: e.target.value,
                        })
                      }
                      className="border-[#E8E3DD]"
                    />
                  </div>
                </div>

                {assignedCategories.length > 0 && (
                  <div className="space-y-3">
                    <Label>Option Values</Label>
                    {assignedCategories.map((catId) => {
                      const cat = optionCategories.find((c) => c.id === catId);
                      const values = cat?.values ?? [];
                      return (
                        <div key={catId}>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            {cat?.name}
                          </p>
                          <Select>
                            <SelectTrigger className="border-[#E8E3DD]">
                              <SelectValue
                                placeholder={`Select ${cat?.name}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {values.map((val) => (
                                <SelectItem key={val.id} value={val.id}>
                                  {val.name}
                                  {val.price_modifier > 0 &&
                                    ` (+${formatPrice(val.price_modifier)})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowSkuDialog(false)}
                  className="border-[#E8E3DD]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSku}
                  className="bg-[#121212] hover:bg-[#121212]/90"
                  disabled={!newSku.sku_code || !newSku.name || isPending}
                >
                  Add SKU
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
