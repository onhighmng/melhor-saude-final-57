import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { userUIcopy } from "@/data/userUIcopy";

interface IdleUserModalProps {
  open: boolean;
  onClose: () => void;
  onBookSession: () => void;
}

export function IdleUserModal({ open, onClose, onBookSession }: IdleUserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            {userUIcopy.crossFlow.idleUserTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            {userUIcopy.crossFlow.idleUserMessage}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button onClick={onBookSession} className="w-full" size="lg">
            {userUIcopy.crossFlow.idleUserCTA}
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            Lembrar Mais Tarde
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
