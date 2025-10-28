import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnsavedChangesBannerProps {
  onSave: () => void;
}

export function UnsavedChangesBanner({ onSave }: UnsavedChangesBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warm-orange/10 border-b border-warm-orange">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-warm-orange">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Tem alterações não guardadas</span>
        </div>
        <Button onClick={onSave} variant="default" size="sm">
          Guardar
        </Button>
      </div>
    </div>
  );
}
