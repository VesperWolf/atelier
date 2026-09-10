"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import Header from "@/components/layout/header";
import { submitConsultation } from "@/lib/actions/consultations";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const consultationSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(7, { message: "Please enter a valid phone number" }),
  company: z.string().optional(),
  projectType: z.enum(["residential", "commercial", "hospitality"], {
    message: "Please select a project type",
  }),
  projectDescription: z
    .string()
    .min(10, { message: "Please describe your project (min 10 characters)" }),
  preferredDate: z.string().min(1, { message: "Please select a preferred date" }),
  preferredTime: z.string().min(1, { message: "Please select a preferred time" }),
  alternativeDate: z.string().optional(),
  budgetRange: z.string().min(1, { message: "Please select a budget range" }),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
];

const budgetRanges = [
  "Under $10,000",
  "$10,000 – $25,000",
  "$25,000 – $50,000",
  "$50,000 – $100,000",
  "$100,000+",
];

export default function ConsultationPage() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      projectType: undefined,
      preferredTime: "",
      budgetRange: "",
    },
  });

  const projectType = watch("projectType");

  const onSubmit = async (data: ConsultationFormData) => {
    try {
      await submitConsultation({
        customer_name: data.fullName,
        customer_email: data.email,
        customer_phone: data.phone || null,
        customer_company: data.company || null,
        project_type: data.projectType,
        project_description: data.projectDescription || null,
        preferred_date: data.preferredDate,
        preferred_time: data.preferredTime || null,
        alternative_date: data.alternativeDate || null,
        budget_range: data.budgetRange || null,
      });
      toast.success("Consultation Requested", {
        description:
          "Thank you! Our team will reach out within 24 hours to confirm your appointment.",
      });
      reset();
    } catch {
      toast.error("Failed to submit", {
        description: "Please try again or contact us directly.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEBE9]">
      <Header />

      {/* Hero */}
      <section className="relative bg-[#121212] px-6 pt-32 pb-20 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-white/80" strokeWidth={1.5} />
              <p className="text-xs tracking-[0.3em] uppercase text-white/80">
                Private Appointments
              </p>
            </div>
            <h1 className="mt-6 font-sans text-4xl tracking-tight text-[#EDEBE9] md:text-5xl lg:text-6xl">
              Book a Consultation
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#EDEBE9]/50">
              Whether you&apos;re envisioning a single statement piece or
              furnishing an entire outdoor living space, our design consultants
              will guide you through every detail — from lattice pattern to
              fabric selection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form section */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Contact info */}
            <div>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-[#121212]">
                Contact Information
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-[#121212]">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Your full name"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">
                      {errors.fullName.message}
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
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    placeholder="Company or firm name"
                    {...register("company")}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-[#E8E3DD]" />

            {/* Project details */}
            <div>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-[#121212]">
                Project Details
              </h2>

              {/* Project type */}
              <div className="mt-6 space-y-3">
                <Label>
                  Project Type <span className="text-[#121212]">*</span>
                </Label>
                <RadioGroup
                  value={projectType}
                  onValueChange={(val) =>
                    setValue("projectType", val as ConsultationFormData["projectType"], {
                      shouldValidate: true,
                    })
                  }
                  className="grid grid-cols-3 gap-3"
                >
                  {(
                    [
                      { value: "residential", label: "Residential" },
                      { value: "commercial", label: "Commercial" },
                      { value: "hospitality", label: "Hospitality" },
                    ] as const
                  ).map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-4 text-sm transition-all ${
                        projectType === opt.value
                          ? "border-[#121212] bg-[#121212]/5 text-[#121212]"
                          : "border-[#E8E3DD] text-[#121212]/60 hover:border-[#121212]/40"
                      }`}
                    >
                      <RadioGroupItem
                        value={opt.value}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </RadioGroup>
                {errors.projectType && (
                  <p className="text-xs text-destructive">
                    {errors.projectType.message}
                  </p>
                )}
              </div>

              {/* Project description */}
              <div className="mt-6 space-y-2">
                <Label htmlFor="projectDescription">
                  Project Description{" "}
                  <span className="text-[#121212]">*</span>
                </Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Tell us about your vision — space dimensions, desired pieces, aesthetic preferences, timeline..."
                  rows={5}
                  {...register("projectDescription")}
                />
                {errors.projectDescription && (
                  <p className="text-xs text-destructive">
                    {errors.projectDescription.message}
                  </p>
                )}
              </div>
            </div>

            <Separator className="bg-[#E8E3DD]" />

            {/* Scheduling */}
            <div>
              <h2 className="text-xs font-medium tracking-[0.2em] uppercase text-[#121212]">
                Scheduling
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">
                    Preferred Date <span className="text-[#121212]">*</span>
                  </Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    {...register("preferredDate")}
                  />
                  {errors.preferredDate && (
                    <p className="text-xs text-destructive">
                      {errors.preferredDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    Preferred Time <span className="text-[#121212]">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("preferredTime", val, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.preferredTime && (
                    <p className="text-xs text-destructive">
                      {errors.preferredTime.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternativeDate">
                    Alternative Date (Optional)
                  </Label>
                  <Input
                    id="alternativeDate"
                    type="date"
                    {...register("alternativeDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Budget Range <span className="text-[#121212]">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("budgetRange", val, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.budgetRange && (
                    <p className="text-xs text-destructive">
                      {errors.budgetRange.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-[#E8E3DD]" />

            {/* Submit */}
            <div className="flex flex-col items-center gap-4 pt-4">
              <Button
                type="submit"
                size="xl"
                disabled={isSubmitting}
                className="w-full rounded-none bg-[#121212] tracking-[0.15em] uppercase text-white hover:bg-[#2a2a2a] sm:w-auto sm:min-w-[320px]"
              >
                {isSubmitting ? "Submitting..." : "Request Consultation"}
              </Button>
              <p className="text-xs text-[#121212]/40">
                Our team will confirm your appointment within 24 hours.
              </p>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
