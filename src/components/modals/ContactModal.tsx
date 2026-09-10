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
            <p>professora@creed.ai</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
