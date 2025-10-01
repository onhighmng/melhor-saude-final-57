import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  actions 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0 bg-white/95 backdrop-blur-sm border-border/40 rounded-2xl shadow-2xl [&>button]:hidden">
        <div className="p-8 md:p-10 border-b border-border/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="font-baskervville text-3xl font-semibold text-foreground mb-2">
                {title}
              </h2>
              {description && (
                <p className="font-maname text-base text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4 ml-6">
              {actions}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted/30 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-6 w-6 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 md:p-10">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullscreenModal;