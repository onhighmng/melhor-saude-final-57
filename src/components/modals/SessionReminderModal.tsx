import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { userUIcopy } from "@/data/userUIcopy";

interface SessionReminderModalProps {
  open: boolean;
  onClose: () => void;
  onJoinNow: () => void;
  onSnooze: () => void;
  providerName: string;
  sessionTime: string;
}

export function SessionReminderModal({ 
  open, 
  onClose, 
  onJoinNow, 
  onSnooze,
  providerName,
  sessionTime,
}: SessionReminderModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-green-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            {userUIcopy.crossFlow.reminderTitle}
          </DialogTitle>
          <DialogDescription className="text-center">
            {userUIcopy.crossFlow.reminderMessage}
            <br />
            <span className="font-semibold">{providerName}</span> às <span className="font-semibold">{sessionTime}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button onClick={onJoinNow} className="w-full" size="lg">
            {userUIcopy.crossFlow.reminderCTAJoin}
          </Button>
          <Button onClick={onSnooze} variant="outline" className="w-full">
            {userUIcopy.crossFlow.reminderCTASnooze}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
