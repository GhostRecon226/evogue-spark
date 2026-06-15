import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequestHeader } from "@tanstack/react-start/server";

export interface GenerateCertificateInput {
  studentId: string;
  courseId: string;
}

export const generateCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: GenerateCertificateInput) => input)
  .handler(async ({ data, context }) => {
    const { studentId, courseId } = data;

    // Authorise: admin OR the student themself.
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin && context.userId !== studentId) {
      throw new Error("Forbidden");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch profile, course, capstone in parallel
    const [profileRes, courseRes, capstoneRes, existingCertRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("full_name, registration_number")
        .eq("id", studentId)
        .maybeSingle(),
      supabaseAdmin
        .from("courses")
        .select("title, slug")
        .eq("id", courseId)
        .maybeSingle(),
      supabaseAdmin
        .from("capstone_submissions")
        .select("status, reviewed_at")
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .maybeSingle(),
      supabaseAdmin
        .from("certificates")
        .select("id, certificate_url, cert_id")
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .maybeSingle(),
    ]);

    const profile = profileRes.data;
    const course = courseRes.data;
    const capstone = capstoneRes.data;
    if (!profile) throw new Error("Student profile not found");
    if (!course) throw new Error("Course not found");
    if (!capstone || capstone.status !== "approved") {
      throw new Error("Capstone is not approved");
    }

    const studentName = (profile.full_name || "Student").trim();
    const courseTitle = course.title || "Course";
    const issuedAt = capstone.reviewed_at ?? new Date().toISOString();
    const registrationNumber = profile.registration_number ?? "EVG-2026-0000";

    // Ensure cert row + cert_id
    let certRow = existingCertRes.data;
    if (!certRow) {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from("certificates")
        .insert({
          student_id: studentId,
          course_id: courseId,
          issued_at: issuedAt,
        } as never)
        .select("id, certificate_url, cert_id")
        .single();
      if (insertErr) throw insertErr;
      certRow = inserted as unknown as typeof certRow;
    }
    const cert = certRow!;
    const certId = cert.cert_id || `CERT-${cert.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

    // Build PDF
    const { PDFDocument, rgb } = await import("pdf-lib");
    const fontkit = (await import("@pdf-lib/fontkit")).default;
    const fonts = await import("./cert-fonts.server");
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.addPage([842, 595]); // A4 landscape pt
    const W = 842;
    const H = 595;

    const FOREST = rgb(0x0a / 255, 0x2e / 255, 0x1a / 255);
    const MINT = rgb(0x00 / 255, 0xf5 / 255, 0xa0 / 255);
    const GREY = rgb(0.42, 0.42, 0.42);

    // Brand fonts: Fraunces (serif) and DM Sans (sans).
    const serif = await pdfDoc.embedFont(fonts.decodeFont(fonts.frRegularB64));
    const serifBold = await pdfDoc.embedFont(fonts.decodeFont(fonts.frBoldB64));
    const sans = await pdfDoc.embedFont(fonts.decodeFont(fonts.dmRegularB64));
    const sansBold = await pdfDoc.embedFont(fonts.decodeFont(fonts.dmBoldB64));
    const sansItalic = await pdfDoc.embedFont(fonts.decodeFont(fonts.dmItalicB64));

    // White background (default).
    // Outer border 8px + inner border for double frame
    page.drawRectangle({
      x: 16, y: 16, width: W - 32, height: H - 32,
      borderColor: FOREST, borderWidth: 8,
    });
    page.drawRectangle({
      x: 40, y: 40, width: W - 80, height: H - 80,
      borderColor: FOREST, borderWidth: 1,
    });

    // Brand wordmark
    const brand = "EVOGUE ACADEMY";
    const brandSize = 14;
    page.drawText(brand, {
      x: (W - sansBold.widthOfTextAtSize(brand, brandSize)) / 2,
      y: H - 90,
      size: brandSize,
      font: sansBold,
      color: FOREST,
    });

    // Heading
    const headline = "CERTIFICATE OF COMPLETION";
    const headlineSize = 24;
    const letterSpace = 4; // simulate letter-spacing
    const chars = headline.split("");
    const headlineWidth =
      chars.reduce((acc, ch) => acc + serifBold.widthOfTextAtSize(ch, headlineSize), 0) +
      letterSpace * (chars.length - 1);
    let cursor = (W - headlineWidth) / 2;
    const headlineY = H - 140;
    for (const ch of chars) {
      page.drawText(ch, {
        x: cursor,
        y: headlineY,
        size: headlineSize,
        font: serifBold,
        color: FOREST,
      });
      cursor += serifBold.widthOfTextAtSize(ch, headlineSize) + letterSpace;
    }

    // Mint divider
    page.drawLine({
      start: { x: W / 2 - 80, y: headlineY - 16 },
      end: { x: W / 2 + 80, y: headlineY - 16 },
      thickness: 1.5,
      color: MINT,
    });

    // "This is to certify that"
    drawCentered(page, "This is to certify that", H - 200, 12, sans, GREY, W);

    // Student name
    const nameSize = 34;
    const nameY = H - 250;
    const nameW = serifBold.widthOfTextAtSize(studentName, nameSize);
    page.drawText(studentName, {
      x: (W - nameW) / 2,
      y: nameY,
      size: nameSize,
      font: serifBold,
      color: FOREST,
    });

    // "has successfully completed"
    drawCentered(page, "has successfully completed", H - 290, 12, sans, GREY, W);

    // Course title
    drawCentered(page, courseTitle, H - 325, 20, serifBold, FOREST, W);

    // "at Evogue Academy"
    drawCentered(page, "at Evogue Academy", H - 355, 12, sans, GREY, W);

    // Mint decorative line
    page.drawLine({
      start: { x: W / 2 - 120, y: H - 395 },
      end: { x: W / 2 + 120, y: H - 395 },
      thickness: 1,
      color: MINT,
    });

    // Two columns: Date Issued / Student ID
    const colY = H - 440;
    const labelSize = 9;
    const valueSize = 12;
    const dateLabel = "DATE ISSUED";
    const dateValue = new Date(issuedAt).toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric",
    });
    const idLabel = "STUDENT ID";
    const idValue = registrationNumber;

    const leftX = W * 0.28;
    const rightX = W * 0.72;
    drawCenteredAt(page, dateLabel, leftX, colY, labelSize, sansBold, GREY);
    drawCenteredAt(page, dateValue, leftX, colY - 18, valueSize, sans, FOREST);
    drawCenteredAt(page, idLabel, rightX, colY, labelSize, sansBold, GREY);
    drawCenteredAt(page, idValue, rightX, colY - 18, valueSize, sans, FOREST);

    // Footer tagline
    drawCentered(
      page,
      "Built in Africa. Open to the World.",
      54,
      11,
      sansItalic,
      GREY,
      W,
    );

    // Cert ID bottom right
    page.drawText(certId, {
      x: W - 60 - sans.widthOfTextAtSize(certId, 9),
      y: 24,
      size: 9,
      font: sans,
      color: GREY,
    });

    const pdfBytes = await pdfDoc.save();

    // Upload to storage
    const slug = (course.slug || courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(
      /^-|-$/g,
      "",
    );
    const safeReg = registrationNumber.replace(/[^A-Za-z0-9-]+/g, "");
    const storagePath = `${safeReg}-${slug}-certificate.pdf`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("certificates")
      .upload(storagePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });
    if (uploadErr) throw uploadErr;

    // Update certificates row with path + cert_id
    const { error: updErr } = await supabaseAdmin
      .from("certificates")
      .update({
        certificate_url: storagePath,
        cert_id: certId,
      } as never)
      .eq("id", cert.id);
    if (updErr) throw updErr;

    // Mint signed URL (7 days)
    const { data: signed } = await supabaseAdmin.storage
      .from("certificates")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 7);

    // Fire-and-forget certificate-ready email. Failures are logged, never thrown.
    try {
      const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(studentId);
      const recipient = userRes?.user?.email;
      if (recipient) {
        const host =
          getRequestHeader("x-forwarded-host") ??
          getRequestHeader("host") ??
          "localhost";
        const proto = getRequestHeader("x-forwarded-proto") ?? "https";
        const authHeader = getRequestHeader("authorization") ?? "";
        const dashboardUrl = `${proto}://${host}/dashboard/certificate`;
        const body = {
          templateName: "certificate-ready",
          recipientEmail: recipient,
          idempotencyKey: `cert-ready-${cert.id}`,
          templateData: {
            fullName: studentName,
            courseName: courseTitle,
            certId,
            issuedAt: new Date(issuedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            certificateUrl: dashboardUrl,
          },
        };
        const res = await fetch(`${proto}://${host}/lovable/email/transactional/send`, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: authHeader },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          console.error("[certificate-ready] email send failed", {
            status: res.status,
            text: await res.text().catch(() => ""),
          });
        }
      }
    } catch (err) {
      console.error("[certificate-ready] email dispatch error", err);
    }

    return {
      certificateId: cert.id,
      certId,
      storagePath,
      signedUrl: signed?.signedUrl ?? null,
    };
  });

function drawCentered(
  page: import("pdf-lib").PDFPage,
  text: string,
  y: number,
  size: number,
  font: import("pdf-lib").PDFFont,
  color: import("pdf-lib").RGB,
  pageWidth: number,
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (pageWidth - w) / 2, y, size, font, color });
}

function drawCenteredAt(
  page: import("pdf-lib").PDFPage,
  text: string,
  cx: number,
  y: number,
  size: number,
  font: import("pdf-lib").PDFFont,
  color: import("pdf-lib").RGB,
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: cx - w / 2, y, size, font, color });
}
