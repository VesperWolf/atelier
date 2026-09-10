"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  updateConsultationStatus,
  addConsultationNotes,
} from "@/lib/actions/consultations";
import type { Consultation } from "@/types/database";
import { toast } from "sonner";

const consultationStatusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-50",
  },
};

const projectTypeLabels: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  hospitality: "Hospitality",
};

interface StatusCounts {
  pending: number;
  confirmed: number;
  completed: number;
}

interface AdminConsultationsClientProps {
  initialConsultations: Consultation[];
  statusCounts: StatusCounts;
}

export default function AdminConsultationsClient({
  initialConsultations,
  statusCounts: initialStatusCounts,
}: AdminConsultationsClientProps) {
  const [consultations, setConsultations] = useState(initialConsultations);
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredConsultations = useMemo(() => {
    return consultations.filter((consultation) => {
      const matchesSearch =
        search === "" ||
        consultation.customer_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        consultation.customer_email
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (consultation.customer_company ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || consultation.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [consultations, search, statusFilter]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function handleStatusChange(
    consultationId: string,
    newStatus: Consultation["status"]
  ) {
    startTransition(async () => {
      try {
        await updateConsultationStatus(consultationId, newStatus);
        setConsultations((prev) =>
          prev.map((c) =>
            c.id === consultationId
              ? { ...c, status: newStatus, updated_at: new Date().toISOString() }
              : c
          )
        );
        setStatusCounts((prev) => {
          const old = consultations.find((c) => c.id === consultationId);
          const next = { ...prev };
          if (old) {
            if (old.status === "pending") next.pending = Math.max(0, next.pending - 1);
            if (old.status === "confirmed") next.confirmed = Math.max(0, next.confirmed - 1);
            if (old.status === "completed") next.completed = Math.max(0, next.completed - 1);
          }
          if (newStatus === "pending") next.pending += 1;
          if (newStatus === "confirmed") next.confirmed += 1;
          if (newStatus === "completed") next.completed += 1;
          return next;
        });
        if (selectedConsultation?.id === consultationId) {
          setSelectedConsultation({
            ...selectedConsultation,
            status: newStatus,
          });
        }
        toast.success("Status updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update status");
      }
    });
  }

  function openDetail(consultation: Consultation) {
    setSelectedConsultation(consultation);
    setEditingNotes(consultation.internal_notes ?? "");
  }

  function handleSaveNotes() {
    if (!selectedConsultation) return;
    startTransition(async () => {
      try {
        await addConsultationNotes(selectedConsultation.id, editingNotes);
        setConsultations((prev) =>
          prev.map((c) =>
            c.id === selectedConsultation.id
              ? {
                  ...c,
                  internal_notes: editingNotes || null,
                  updated_at: new Date().toISOString(),
                }
              : c
          )
        );
        setSelectedConsultation({
          ...selectedConsultation,
          internal_notes: editingNotes || null,
        });
        toast.success("Notes saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save notes");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[#121212] font-sans">
          Consultations
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage customer consultation requests.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-lg">
        <Card className="border-[#E8E3DD]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {statusCounts.pending}
            </p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-[#E8E3DD]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {statusCounts.confirmed}
            </p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card className="border-[#E8E3DD]">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {statusCounts.completed}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search consultations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-[#E8E3DD]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-[#E8E3DD]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#E8E3DD] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Project Type</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConsultations.map((consultation) => {
              const status =
                consultationStatusConfig[consultation.status];
              return (
                <TableRow key={consultation.id}>
                  <TableCell className="font-medium text-sm">
                    {consultation.customer_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {consultation.customer_email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {consultation.customer_company || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-[#EDEBE9] text-[#121212]"
                    >
                      {projectTypeLabels[consultation.project_type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(consultation.preferred_date)}
                    </div>
                    {consultation.preferred_time && (
                      <span className="text-xs text-muted-foreground ml-5">
                        {consultation.preferred_time}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={status?.className}>
                      {status?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openDetail(consultation)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(
                              consultation.id,
                              "confirmed"
                            )
                          }
                          disabled={isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(
                              consultation.id,
                              "completed"
                            )
                          }
                          disabled={isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            handleStatusChange(
                              consultation.id,
                              "cancelled"
                            )
                          }
                          disabled={isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredConsultations.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No consultations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedConsultation}
        onOpenChange={(open) => !open && setSelectedConsultation(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
            <DialogDescription>
              Request from {selectedConsultation?.customer_name}
            </DialogDescription>
          </DialogHeader>
          {selectedConsultation && (
            <div className="space-y-4">
              {/* Contact info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Name
                  </h4>
                  <p className="text-sm font-medium">
                    {selectedConsultation.customer_name}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Email
                  </h4>
                  <p className="text-sm">{selectedConsultation.customer_email}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Phone
                  </h4>
                  <p className="text-sm">
                    {selectedConsultation.customer_phone || "—"}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Company
                  </h4>
                  <p className="text-sm">
                    {selectedConsultation.customer_company || "—"}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#E8E3DD]/60" />

              {/* Project info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Project Type
                  </h4>
                  <Badge
                    variant="secondary"
                    className="bg-[#EDEBE9] text-[#121212]"
                  >
                    {projectTypeLabels[selectedConsultation.project_type]}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Budget Range
                  </h4>
                  <p className="text-sm">
                    {selectedConsultation.budget_range || "Not specified"}
                  </p>
                </div>
              </div>

              {selectedConsultation.project_description && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Project Description
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedConsultation.project_description}
                  </p>
                </div>
              )}

              <Separator className="bg-[#E8E3DD]/60" />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Preferred Date
                  </h4>
                  <p className="text-sm">
                    {formatDate(selectedConsultation.preferred_date)}
                    {selectedConsultation.preferred_time &&
                      ` at ${selectedConsultation.preferred_time}`}
                  </p>
                </div>
                {selectedConsultation.alternative_date && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Alternative Date
                    </h4>
                    <p className="text-sm">
                      {formatDate(selectedConsultation.alternative_date)}
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Status
                </h4>
                <Select
                  value={selectedConsultation.status}
                  onValueChange={(val) => {
                    const newStatus = val as Consultation["status"];
                    handleStatusChange(selectedConsultation.id, newStatus);
                    setSelectedConsultation({
                      ...selectedConsultation,
                      status: newStatus,
                    });
                  }}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-44 border-[#E8E3DD]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-[#E8E3DD]/60" />

              {/* Internal notes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Internal Notes
                  </h4>
                </div>
                <Textarea
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes..."
                  className="border-[#E8E3DD] bg-amber-50/30"
                />
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  className="bg-[#121212] hover:bg-[#121212]/90"
                  disabled={isPending}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}