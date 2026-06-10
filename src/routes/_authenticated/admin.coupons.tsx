import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Ticket, CheckCircle2, BarChart3, Clock, Loader2, Search, Pencil, Trash2, Eye, EyeOff, CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  component: CouponsPage,
});

type Coupon = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  usage_limit: number | null;
  times_used: number;
  expiry_date: string | null;
  active: boolean;
  description: string | null;
  created_at: string;
};

type Redemption = {
  id: string;
  student_id: string;
  coupon_code: string;
  discount_type: string;
  discount_value: number;
  applied_at: string;
  student_name: string;
  student_reg: string | null;
  enrolment_status: "Pending" | "Enrolled" | "Not enrolled";
};

type FormState = {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  usage_limit: string;
  expiry_date: Date | undefined;
  active: boolean;
  description: string;
};

const emptyForm: FormState = {
  code: "",
  discount_type: "percentage",
  discount_value: "",
  usage_limit: "",
  expiry_date: undefined,
  active: true,
  description: "",
};

const isExpired = (c: Coupon) => !!c.expiry_date && new Date(c.expiry_date) < new Date(new Date().toDateString());

const formatDiscount = (type: string, value: number) =>
  type === "fixed" ? `£${value}` : `${value}%`;

function CouponsPage() {
  return (
    <AdminGuard>
      <CouponsInner />
    </AdminGuard>
  );
}

function CouponsInner() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [toDelete, setToDelete] = useState<Coupon | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: c }, { data: r }] = await Promise.all([
      supabase
        .from("coupon_codes")
        .select("id, code, discount_type, discount_value, usage_limit, times_used, expiry_date, active, description, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("coupon_redemptions")
        .select("id, student_id, coupon_code, discount_type, discount_value, applied_at")
        .order("applied_at", { ascending: false }),
    ]);

    const couponList = (c ?? []).map((row) => ({
      ...row,
      discount_value: Number(row.discount_value ?? 0),
    })) as Coupon[];

    const studentIds = Array.from(new Set((r ?? []).map((x) => x.student_id)));
    let profileMap = new Map<string, { name: string; reg: string | null }>();
    let enrolmentMap = new Map<string, number>();
    if (studentIds.length > 0) {
      const [{ data: profs }, { data: enrols }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, registration_number").in("id", studentIds),
        supabase.from("enrollments").select("student_id").in("student_id", studentIds),
      ]);
      profileMap = new Map((profs ?? []).map((p) => [p.id, { name: p.full_name ?? "Unnamed", reg: p.registration_number }]));
      for (const e of enrols ?? []) {
        enrolmentMap.set(e.student_id, (enrolmentMap.get(e.student_id) ?? 0) + 1);
      }
    }

    const reds: Redemption[] = (r ?? []).map((row) => {
      const p = profileMap.get(row.student_id);
      const enrolled = (enrolmentMap.get(row.student_id) ?? 0) > 0;
      return {
        id: row.id,
        student_id: row.student_id,
        coupon_code: row.coupon_code,
        discount_type: row.discount_type,
        discount_value: Number(row.discount_value ?? 0),
        applied_at: row.applied_at,
        student_name: p?.name ?? "Unknown",
        student_reg: p?.reg ?? null,
        enrolment_status: enrolled ? "Enrolled" : "Pending",
      };
    });

    setCoupons(couponList);
    setRedemptions(reds);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 86400 * 1000);
    return {
      total: coupons.length,
      active: coupons.filter((c) => c.active && !isExpired(c)).length,
      redemptions: coupons.reduce((s, c) => s + (c.times_used ?? 0), 0),
      expiringSoon: coupons.filter((c) => {
        if (!c.expiry_date) return false;
        const d = new Date(c.expiry_date);
        return d >= now && d <= in7;
      }).length,
    };
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    const q = search.trim().toUpperCase();
    return coupons.filter((c) => {
      if (q && !c.code.includes(q)) return false;
      if (filter === "active") return c.active && !isExpired(c);
      if (filter === "inactive") return !c.active;
      if (filter === "expired") return isExpired(c);
      return true;
    });
  }, [coupons, search, filter]);

  const validateForm = (f: FormState): string | null => {
    const code = f.code.trim().toUpperCase();
    if (!code) return "Coupon code is required.";
    if (/\s/.test(code)) return "Coupon code cannot contain spaces.";
    const val = Number(f.discount_value);
    if (!f.discount_value || Number.isNaN(val) || val <= 0) return "Discount value must be greater than 0.";
    if (f.discount_type === "percentage" && val > 100) return "Percentage cannot exceed 100.";
    if (f.usage_limit) {
      const u = Number(f.usage_limit);
      if (Number.isNaN(u) || u < 1) return "Usage limit must be a positive number.";
    }
    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm(form);
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    const { error } = await supabase.from("coupon_codes").insert({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      discount_percentage: form.discount_type === "percentage" ? Number(form.discount_value) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      expiry_date: form.expiry_date ? format(form.expiry_date, "yyyy-MM-dd") : null,
      active: form.active,
      description: form.description.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.error("A code with this name already exists.");
      else toast.error(error.message || "Failed to create coupon.");
      return;
    }
    toast.success("Coupon code created successfully.");
    setForm(emptyForm);
    void load();
  };

  const handleToggle = async (c: Coupon) => {
    const { error } = await supabase.from("coupon_codes").update({ active: !c.active }).eq("id", c.id);
    if (error) { toast.error("Could not update status."); return; }
    setCoupons((rows) => rows.map((r) => (r.id === c.id ? { ...r, active: !c.active } : r)));
    toast.success(`Coupon ${!c.active ? "activated" : "deactivated"}.`);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("coupon_codes").delete().eq("id", toDelete.id);
    if (error) { toast.error("Could not delete coupon."); return; }
    setCoupons((rows) => rows.filter((r) => r.id !== toDelete.id));
    toast.success("Coupon deleted.");
    setToDelete(null);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setEditForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      usage_limit: c.usage_limit != null ? String(c.usage_limit) : "",
      expiry_date: c.expiry_date ? new Date(c.expiry_date) : undefined,
      active: c.active,
      description: c.description ?? "",
    });
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const err = validateForm(editForm);
    if (err) { toast.error(err); return; }
    const { error } = await supabase.from("coupon_codes").update({
      code: editForm.code.trim().toUpperCase(),
      discount_type: editForm.discount_type,
      discount_value: Number(editForm.discount_value),
      discount_percentage: editForm.discount_type === "percentage" ? Number(editForm.discount_value) : null,
      usage_limit: editForm.usage_limit ? Number(editForm.usage_limit) : null,
      expiry_date: editForm.expiry_date ? format(editForm.expiry_date, "yyyy-MM-dd") : null,
      active: editForm.active,
      description: editForm.description.trim() || null,
    }).eq("id", editing.id);
    if (error) {
      if (error.code === "23505") toast.error("A code with this name already exists.");
      else toast.error(error.message || "Failed to update coupon.");
      return;
    }
    toast.success("Coupon updated.");
    setEditing(null);
    void load();
  };

  const couponColumns: Column<Coupon>[] = [
    {
      key: "code", header: "Code", sortable: true,
      accessor: (r) => r.code,
      cell: (r) => <span className="font-mono font-semibold text-[#0A2E1A]">{r.code}</span>,
    },
    {
      key: "discount", header: "Discount", sortable: true,
      accessor: (r) => r.discount_value,
      cell: (r) => <span>{formatDiscount(r.discount_type, r.discount_value)}</span>,
    },
    {
      key: "type", header: "Type", sortable: true,
      accessor: (r) => r.discount_type,
      cell: (r) => <span className="capitalize">{r.discount_type}</span>,
    },
    {
      key: "used", header: "Used", sortable: true,
      accessor: (r) => r.times_used,
      cell: (r) => <span>{r.times_used} / {r.usage_limit ?? "∞"}</span>,
    },
    {
      key: "expiry", header: "Expiry", sortable: true,
      accessor: (r) => r.expiry_date ?? "",
      cell: (r) => <span>{r.expiry_date ? format(new Date(r.expiry_date), "PP") : "No expiry"}</span>,
    },
    {
      key: "status", header: "Status", sortable: true,
      accessor: (r) => isExpired(r) ? "expired" : r.active ? "active" : "inactive",
      cell: (r) => {
        if (isExpired(r)) return <Pill tone="red">Expired</Pill>;
        if (r.active) return <Pill tone="green">Active</Pill>;
        return <Pill tone="grey">Inactive</Pill>;
      },
    },
  ];

  const redemptionColumns: Column<Redemption>[] = [
    {
      key: "student", header: "Student", sortable: true,
      accessor: (r) => r.student_name,
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-[#0A2E1A] truncate">{r.student_name}</p>
          {r.student_reg && <p className="text-[11px] text-foreground/55 font-mono">{r.student_reg}</p>}
        </div>
      ),
    },
    {
      key: "code", header: "Code Used", sortable: true,
      accessor: (r) => r.coupon_code,
      cell: (r) => <span className="font-mono font-semibold">{r.coupon_code}</span>,
    },
    {
      key: "discount", header: "Discount", sortable: true,
      accessor: (r) => r.discount_value,
      cell: (r) => <span>{formatDiscount(r.discount_type, r.discount_value)}</span>,
    },
    {
      key: "applied_at", header: "Applied On", sortable: true,
      accessor: (r) => r.applied_at,
      cell: (r) => <span>{format(new Date(r.applied_at), "PP")}</span>,
    },
    {
      key: "enrol", header: "Enrolment Status",
      accessor: (r) => r.enrolment_status,
      cell: (r) => (
        r.enrolment_status === "Enrolled" ? <Pill tone="green">Enrolled</Pill>
        : r.enrolment_status === "Pending" ? <Pill tone="amber">Pending</Pill>
        : <Pill tone="grey">Not enrolled</Pill>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#0A2E1A]">Coupon Codes</h1>
        <p className="text-[14px] text-[rgba(10,46,26,0.5)] mt-1">Create and manage discount codes for student enrolments.</p>
      </div>

      {/* Section 1 — stats */}
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Ticket} label="Total Codes" value={loading ? "…" : String(stats.total)} accent="border-t-4 border-[#00F5A0]" iconBg="bg-[#00F5A0]" iconColor="text-[#0A2E1A]" />
        <StatCard icon={CheckCircle2} label="Active Codes" value={loading ? "…" : String(stats.active)} accent="border-t-4 border-[#1A8C4E]" iconBg="bg-[#1A8C4E]" iconColor="text-white" />
        <StatCard icon={BarChart3} label="Total Redemptions" value={loading ? "…" : String(stats.redemptions)} accent="border-t-4 border-[#0A2E1A]" iconBg="bg-[#0A2E1A]" iconColor="text-[#00F5A0]" />
        <StatCard icon={Clock} label="Expiring Soon" value={loading ? "…" : String(stats.expiringSoon)} accent="border-t-4 border-[#F59E0B]" iconBg="bg-[#F59E0B]" iconColor="text-white" />
      </div>

      {/* Section 2 — Create */}
      <div className="bg-white rounded-xl border border-[rgba(10,46,26,0.08)] p-7 mt-7 mb-7">
        <h2 className="text-[16px] font-semibold text-[#0A2E1A] mb-5">Create New Code</h2>
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <FormFieldRow
            label="Coupon Code"
            input={
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                placeholder="e.g. EVOGUE20"
                className="uppercase tracking-wider font-mono"
                maxLength={32}
              />
            }
          />
          <FormFieldRow
            label="Discount Type"
            input={
              <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v as "percentage" | "fixed" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <FormFieldRow
            label="Discount Value"
            input={<Input type="number" min="0" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder="e.g. 20" />}
          />
          <FormFieldRow
            label="Usage Limit"
            input={<Input type="number" min="1" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Leave blank for unlimited" />}
          />
          <FormFieldRow
            label="Expiry Date"
            input={
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !form.expiry_date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.expiry_date ? format(form.expiry_date, "PP") : <span>No expiry</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                  <Calendar mode="single" selected={form.expiry_date} onSelect={(d) => setForm({ ...form, expiry_date: d ?? undefined })} initialFocus className={cn("p-3 pointer-events-auto")} />
                  {form.expiry_date && (
                    <div className="p-2 border-t"><Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, expiry_date: undefined })}>Clear</Button></div>
                  )}
                </PopoverContent>
              </Popover>
            }
          />
          <FormFieldRow
            label="Status"
            input={
              <div className="flex items-center gap-3 h-10">
                <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <span className="text-sm text-foreground/70">{form.active ? "Active" : "Inactive"}</span>
              </div>
            }
          />
          <div className="sm:col-span-2">
            <FormFieldRow
              label="Description (internal note)"
              input={<Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Launch promotion for first cohort" maxLength={200} />}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={submitting} className="bg-[#0A2E1A] text-white hover:bg-[#1A8C4E] px-7 py-3 h-auto rounded-lg">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Coupon"}
            </Button>
          </div>
        </form>
      </div>

      {/* Section 3 — table */}
      <div className="bg-white rounded-xl border border-[rgba(10,46,26,0.08)] p-6 mb-7">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="text-[16px] font-semibold text-[#0A2E1A]">All Coupon Codes</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search codes..." className="pl-9 w-[220px]" />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div className="grid place-items-center py-12 text-foreground/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <DataTable
            rows={filteredCoupons}
            columns={couponColumns}
            rowKey={(r) => r.id}
            emptyMessage="No coupon codes match your filters."
            actions={(r) => (
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(r)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleToggle(r)} title={r.active ? "Deactivate" : "Activate"}>
                  {r.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setToDelete(r)} title="Delete" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            )}
          />
        )}
      </div>

      {/* Section 4 — redemption log */}
      <div className="bg-white rounded-xl border border-[rgba(10,46,26,0.08)] p-6">
        <div className="mb-4">
          <h2 className="text-[16px] font-semibold text-[#0A2E1A]">Redemption Log</h2>
          <p className="text-[13px] text-[rgba(10,46,26,0.5)] mt-1">Students who have applied a coupon code to their account.</p>
        </div>
        {loading ? (
          <div className="grid place-items-center py-12 text-foreground/50"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <DataTable
            rows={redemptions}
            columns={redemptionColumns}
            rowKey={(r) => r.id}
            emptyMessage="No redemptions yet. Codes applied by students will appear here."
          />
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFieldRow
              label="Coupon Code"
              input={
                <Input
                  value={editForm.code}
                  onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                  className="uppercase tracking-wider font-mono"
                  maxLength={32}
                />
              }
            />
            <FormFieldRow
              label="Discount Type"
              input={
                <Select value={editForm.discount_type} onValueChange={(v) => setEditForm({ ...editForm, discount_type: v as "percentage" | "fixed" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
            <FormFieldRow
              label="Discount Value"
              input={<Input type="number" min="0" step="0.01" value={editForm.discount_value} onChange={(e) => setEditForm({ ...editForm, discount_value: e.target.value })} />}
            />
            <FormFieldRow
              label="Usage Limit"
              input={<Input type="number" min="1" value={editForm.usage_limit} onChange={(e) => setEditForm({ ...editForm, usage_limit: e.target.value })} placeholder="Unlimited" />}
            />
            <FormFieldRow
              label="Expiry Date"
              input={
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !editForm.expiry_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.expiry_date ? format(editForm.expiry_date, "PP") : <span>No expiry</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                    <Calendar mode="single" selected={editForm.expiry_date} onSelect={(d) => setEditForm({ ...editForm, expiry_date: d ?? undefined })} initialFocus className={cn("p-3 pointer-events-auto")} />
                    {editForm.expiry_date && (
                      <div className="p-2 border-t"><Button type="button" variant="ghost" size="sm" onClick={() => setEditForm({ ...editForm, expiry_date: undefined })}>Clear</Button></div>
                    )}
                  </PopoverContent>
                </Popover>
              }
            />
            <FormFieldRow
              label="Status"
              input={
                <div className="flex items-center gap-3 h-10">
                  <Switch checked={editForm.active} onCheckedChange={(v) => setEditForm({ ...editForm, active: v })} />
                  <span className="text-sm text-foreground/70">{editForm.active ? "Active" : "Inactive"}</span>
                </div>
              }
            />
            <div className="sm:col-span-2">
              <FormFieldRow
                label="Description (internal note)"
                input={<Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} maxLength={200} />}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleEditSave} className="bg-[#0A2E1A] text-white hover:bg-[#1A8C4E]">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete coupon code?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this code? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FormFieldRow({ label, input }: { label: string; input: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] text-foreground/70">{label}</Label>
      {input}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, iconBg, iconColor, accent }: { icon: typeof Ticket; label: string; value: string; iconBg: string; iconColor: string; accent: string }) {
  return (
    <div className={`rounded-2xl bg-background border border-border p-5 flex items-center gap-4 shadow-sm ${accent}`}>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${iconBg} ${iconColor}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="text-[12px] uppercase tracking-wider font-semibold text-foreground/55">{label}</p>
        <p className="font-display font-extrabold text-forest text-2xl truncate">{value}</p>
      </div>
    </div>
  );
}

function Pill({ tone, children }: { tone: "green" | "grey" | "red" | "amber"; children: React.ReactNode }) {
  const styles = {
    green: "bg-[rgba(0,245,160,0.15)] text-[#0A5C2A] border-[rgba(0,245,160,0.35)]",
    grey: "bg-foreground/5 text-foreground/60 border-foreground/10",
    red: "bg-[rgba(220,38,38,0.08)] text-[#991b1b] border-[rgba(220,38,38,0.25)]",
    amber: "bg-amber-100 text-amber-800 border-amber-300",
  }[tone];
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${styles}`}>{children}</span>;
}
