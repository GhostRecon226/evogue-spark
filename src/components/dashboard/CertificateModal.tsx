import { Link } from "@tanstack/react-router";
import { Award, Download, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { generateCertificate } from "@/lib/generate-certificate";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  studentName: string;
  courseTitle: string;
  issuedAt: string | Date;
};

export function CertificateModal({ open, onOpenChange, studentName, courseTitle, issuedAt }: Props) {
  const download = () => generateCertificate({ studentName, courseTitle, issuedAt });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="mx-auto -mt-2 grid h-16 w-16 place-items-center rounded-full bg-mint">
          <Award className="h-8 w-8 text-forest" />
        </div>
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-display text-2xl font-extrabold text-forest flex items-center justify-center gap-2">
            <PartyPopper className="h-5 w-5 text-star" />
            Congratulations, {studentName?.split(" ")[0] || "Student"}!
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            You've completed <span className="font-semibold text-forest">{courseTitle}</span>. Your certificate is ready.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex flex-col gap-2">
          <Button onClick={download} className="w-full rounded-full bg-forest text-mint hover:bg-forest/90 font-bold">
            <Download className="h-4 w-4 mr-2" /> Download Certificate
          </Button>
          <Button asChild variant="ghost" className="w-full rounded-full">
            <Link to="/dashboard/certificates" onClick={() => onOpenChange(false)}>
              View all certificates
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
