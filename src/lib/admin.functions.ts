import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const createStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        full_name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(255),
        whatsapp_number: z.string().trim().min(3).max(30),
        password: z.string().min(8).max(72),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        whatsapp_number: data.whatsapp_number,
      },
    });
    if (createErr) throw new Error(createErr.message);
    if (!created.user) throw new Error("Failed to create user");

    // The handle_new_user trigger inserts profile + student role automatically.
    // Make sure WhatsApp & full_name are set even if metadata path missed.
    await supabaseAdmin
      .from("profiles")
      .update({
        full_name: data.full_name,
        whatsapp_number: data.whatsapp_number,
      })
      .eq("id", created.user.id);

    return { id: created.user.id };
  });

export const setStudentActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ student_id: z.string().uuid(), is_active: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: data.is_active })
      .eq("id", data.student_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const promoteToAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ email: z.string().trim().email().max(255) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: prof, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!prof) throw new Error("No user with that email");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: prof.id, role: "admin" });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const adminCreateEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        student_id: z.string().uuid(),
        course_id: z.string().uuid(),
        cohort_id: z.string().uuid().optional().nullable(),
        payment_status: z.enum(["paid", "pending"]).default("paid"),
        payment_reference: z.string().trim().max(120).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("enrollments").insert({
      student_id: data.student_id,
      course_id: data.course_id,
      cohort_id: data.cohort_id ?? null,
      payment_status: data.payment_status,
      payment_reference: data.payment_reference ?? null,
      enrolled_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
