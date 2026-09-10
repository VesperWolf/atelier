"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useCartStore } from "@/lib/store";
import { formatPrice, generateOrderNumber } from "@/lib/utils";
import { createOrder } from "@/lib/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const checkoutSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(7, { message: "Please enter a valid phone number" }),
  addressLine1: z.string().min(3, { message: "Address is required" }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zip: z.string().min(4, { message: "ZIP code is required" }),
  country: z.string().min(1, { message: "Country is required" }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = getSubtotal();
  const estimatedTax = subtotal * 0.08;
  const shippingAmount = 0;
  const total = subtotal + estimatedTax + shippingAmount;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "United States",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        sku_id: item.sku?.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        ...(item.selectedOptions.length > 0 && {
          option_value_ids: item.selectedOptions.map((opt) => opt.value.id),
        }),
      }));

      await createOrder(
        {
          order_number: generateOrderNumber(),
          customer_id: null,
          customer_email: data.email,
          customer_name: `${data.firstName} ${data.lastName}`,
          customer_phone: data.phone || null,
          shipping_address_line1: data.addressLine1,
          shipping_address_line2: data.addressLine2 || null,
          shipping_city: data.city,
          shipping_state: data.state,
          shipping_zip: data.zip,
          shipping_country: data.country,
          status: "pending",
          payment_status: "pending",
          payment_intent_id: null,
          subtotal,
          tax_amount: estimatedTax,
          shipping_amount: shippingAmount,
          total,
          notes: null,
        },
        orderItems
      );

      toast.success("Order Placed Successfully", {
        description:
          "Thank you for your order! You'll receive a confirmation email shortly.",
      });
      clearCart();
      router.push("/");
    } catch {
      toast.error("Order Failed", {
        description: "Something went wrong. Please try again.",
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#EDEBE9]">
        <Header />
        <div className="bg-[#121212] px-6 pt-32 pb-12 lg:px-12">
          <div className="mx-auto max-w-[1400px]">
            <h1 className="font-sans text-4xl tracking-tight text-[#EDEBE9] md:text-5xl">
              Checkout
            </h1>
          </div>
        </div>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDEBE9]">
            <ShoppingBag
              className="h-8 w-8 text-[#121212]"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="font-sans text-xl text-[#121212]">
              Your cart is empty
            </p>
            <p className="mt-1 text-sm text-[#121212]/50">
              Add some pieces to your cart before checking out.
            </p>
          </div>
          <Button
            size="lg"
            className="rounded-none bg-[#121212] tracking-[0.1em] uppercase text-white hover:bg-[#2a2a2a]"
            asChild
          >
            <Link href="/products">Browse Collection</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEBE9]">
      <Header />

      {/* Header */}
      <div className="bg-[#121212] px-6 pt-32 pb-12 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-xs tracking-[0.3em] uppercase text-white/80">
            Secure Checkout
          </p>
          <h1 className="mt-4 font-sans text-4xl tracking-tight text-[#EDEBE9] md:text-5xl">
            Checkout
          </h1>
        </div>
      </div>

      {/* Main content */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-12 lg:grid-cols-3"
          >
            {/* Left – Shipping form */}
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-[#121212]">
                  Shipping Information
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-[#121212]">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="First name"
                      {...register("firstName")}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-[#121212]">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      {...register("lastName")}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-[#121212]">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone <span className="text-[#121212]">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="bg-[#E8E3DD]" />

              <div>
                <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-[#121212]">
                  Shipping Address
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="addressLine1">
                      Address Line 1 <span className="text-[#121212]">*</span>
                    </Label>
                    <Input
                      id="addressLine1"
                      placeholder="Street address"
                      {...register("addressLine1")}
                    />
                    {errors.addressLine1 && (
                      <p className="text-xs text-destructive">
                        {errors.addressLine1.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="addressLine2">
                      Address Line 2 (Optional)
                    </Label>
                    <Input
                      id="addressLine2"
                      placeholder="Apt, suite, unit, etc."
                      {...register("addressLine2")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">
                      City <span className="text-[#121212]">*</span>
                    </Label>
                    <Input
                      id="city"
                      placeholder="City"
                      {...register("city")}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">
                      State <span className="text-[#121212]">*</span>
                    </Label>
                    <Input
                      id="state"
                      placeholder="State"
                      {...register("state")}
                    />
                    {errors.state && (
                      <p className="text-xs text-destructive">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">
                      ZIP Code <span className="text-[#121212]">*</span>
                    </Label>
                    <Input
                      id="zip"
                      placeholder="ZIP code"
                      {...register("zip")}
                    />
                    {errors.zip && (
                      <p className="text-xs text-destructive">
                        {errors.zip.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country <span className="text-[#121212]">*</span>
                    </Label>
                    <Input
                      id="country"
                      placeholder="Country"
                      {...register("country")}
                    />
                    {errors.country && (
                      <p className="text-xs text-destructive">
                        {errors.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right – Order summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-lg border border-[#E8E3DD] bg-white p-6">
                <h2 className="font-sans text-lg text-[#121212]">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="h-14 w-14 shrink-0 rounded bg-gradient-to-br from-[#121212]/20 to-[#121212]/5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#121212] truncate">
                          {item.product.name}
                        </p>
                        {item.selectedOptions.map((opt, i) => (
                          <p
                            key={i}
                            className="text-xs text-[#121212]/40 truncate"
                          >
                            {opt.category.name}: {opt.value.name}
                          </p>
                        ))}
                        <p className="mt-1 text-xs text-[#121212]/60">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-[#121212]">
                        {formatPrice(item.totalPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="my-6 bg-[#E8E3DD]" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#121212]/60">Subtotal</span>
                    <span className="text-[#121212]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#121212]/60">Estimated Tax</span>
                    <span className="text-[#121212]">
                      {formatPrice(estimatedTax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#121212]/60">Shipping</span>
                    <span className="text-[#121212]/70">Complimentary</span>
                  </div>
                  <Separator className="bg-[#E8E3DD]" />
                  <div className="flex justify-between">
                    <span className="font-medium text-[#121212]">Total</span>
                    <span className="font-sans text-xl font-medium text-[#121212]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="xl"
                  disabled={isSubmitting}
                  className="mt-6 w-full rounded-none bg-[#121212] tracking-[0.15em] uppercase text-white hover:bg-[#2a2a2a]"
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>

                <p className="mt-4 text-center text-xs text-[#121212]/40">
                  White-glove delivery included. Payment will be processed upon
                  order confirmation.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
