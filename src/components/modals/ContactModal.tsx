import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entre em contato</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="font-bold">Profª Naira Maria Lobraico Libermann</p>
          </div>

          <div>
            <p className="font-medium">Email</p>
            <p>naira.libermann@gmail.com</p>
          </div>
          <div>
            <p className="font-medium">Telefone</p>
            <p>+55 (51) 9961.4494</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
