import { jsPDF } from "jspdf";

export type CertificateInput = {
  studentName: string;
  courseTitle: string;
  issuedAt: string | Date;
};

const FOREST = "#0F2E1F";
const MINT = "#D8F0DC";
const GOLD = "#C9A84C";
const INK = "#1A1A1A";
const MUTED = "#6B7A6F";

export function generateCertificate({ studentName, courseTitle, issuedAt }: CertificateInput) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  // Outer mint band
  doc.setFillColor(MINT);
  doc.rect(0, 0, W, 18, "F");
  doc.rect(0, H - 18, W, 18, "F");

  // Forest border frame
  doc.setDrawColor(FOREST);
  doc.setLineWidth(2);
  doc.rect(28, 28, W - 56, H - 56);
  doc.setLineWidth(0.5);
  doc.rect(36, 36, W - 72, H - 72);

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setTextColor(FOREST);
  doc.setFontSize(14);
  doc.text("EVOGUE ACADEMY", W / 2, 80, { align: "center" });

  doc.setDrawColor(GOLD);
  doc.setLineWidth(1);
  doc.line(W / 2 - 40, 90, W / 2 + 40, 90);

  // Headline
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(FOREST);
  doc.text("Certificate of Completion", W / 2, 160, { align: "center" });

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(MUTED);
  doc.text("This is to certify that", W / 2, 210, { align: "center" });

  // Student name
  doc.setFont("times", "bolditalic");
  doc.setFontSize(40);
  doc.setTextColor(INK);
  doc.text(studentName || "Student", W / 2, 270, { align: "center" });

  // Underline name
  const nameWidth = doc.getTextWidth(studentName || "Student");
  doc.setDrawColor(GOLD);
  doc.setLineWidth(0.7);
  doc.line(W / 2 - nameWidth / 2 - 10, 282, W / 2 + nameWidth / 2 + 10, 282);

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(MUTED);
  doc.text("has successfully completed the course", W / 2, 320, { align: "center" });

  // Course title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(FOREST);
  doc.text(courseTitle, W / 2, 360, { align: "center", maxWidth: W - 200 });

  // Date + signature row
  const dateStr = new Date(issuedAt).toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });

  const baseY = H - 110;

  // Date column (left)
  doc.setDrawColor(INK);
  doc.setLineWidth(0.5);
  doc.line(110, baseY, 280, baseY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(FOREST);
  doc.text(dateStr, 195, baseY - 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text("Date of Completion", 195, baseY + 16, { align: "center" });

  // Signature column (right)
  doc.line(W - 280, baseY, W - 110, baseY);
  doc.setFont("times", "italic");
  doc.setFontSize(16);
  doc.setTextColor(FOREST);
  doc.text("Evogue Academy", W - 195, baseY - 8, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(MUTED);
  doc.text("Director of Studies", W - 195, baseY + 16, { align: "center" });

  // Seal
  doc.setDrawColor(GOLD);
  doc.setLineWidth(1.5);
  doc.circle(W / 2, baseY + 4, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(GOLD);
  doc.text("EVOGUE", W / 2, baseY, { align: "center" });
  doc.text("ACADEMY", W / 2, baseY + 10, { align: "center" });

  const safeSlug = courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  doc.save(`Evogue-Certificate-${safeSlug || "course"}.pdf`);
}
