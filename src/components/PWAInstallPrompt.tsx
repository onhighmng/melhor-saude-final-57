import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isHTTPS, setIsHTTPS] = useState(false);

  useEffect(() => {
    // Check if served over HTTPS (or localhost for development)
    const isSecure = location.protocol === 'https:' || 
                    location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1';
    setIsHTTPS(isSecure);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isWebAPK = (window as any).navigator?.standalone;
    setIsInstalled(isStandalone || isWebAPK);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during install prompt:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
  };

  // Don't show if not HTTPS, already installed, or no prompt available
  if (!isHTTPS || isInstalled || !showInstallButton || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Instalar App</h3>
          <p className="text-xs text-muted-foreground">
            Adicione o Melhor Saúde ao seu dispositivo para acesso rápido
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="gap-1"
          >
            <Download className="w-3 h-3" />
            Instalar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;