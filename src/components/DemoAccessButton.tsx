import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DemoAccessButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/demo')}
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50 shadow-lg bg-background/95 backdrop-blur-sm hover:bg-accent flex items-center gap-2"
    >
      <Play className="h-4 w-4" />
      Modo Demo
    </Button>
  );
}
