import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: () => void;
  onEnable2FA: () => void;
}

export const SecurityModal = ({ isOpen, onClose, onChangePassword, onEnable2FA }: SecurityModalProps) => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = () => {
    onChangePassword();
    setShowPasswordDialog(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handle2FAEnable = () => {
    onEnable2FA();
    setShow2FADialog(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">Segurança & Acesso</h2>
                <p className="text-sm text-muted-foreground">Gerir as definições de segurança da sua conta</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">Palavra-passe</Label>
                    <p className="text-sm text-muted-foreground">
                      Última alteração em 15 de Janeiro, 2024
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                    Alterar Palavra-Passe
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="text-base">Autenticação de dois fatores (2FA)</Label>
                    <p className="text-sm text-muted-foreground">
                      Estado: Desativado
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setShow2FADialog(true)}>
                    Ativar 2FA
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/50">
              <Button variant="outline" onClick={onClose}>Fechar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Palavra-Passe</DialogTitle>
            <DialogDescription>
              Introduza a sua palavra-passe atual e escolha uma nova palavra-passe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Palavra-passe atual</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova palavra-passe</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova palavra-passe</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePasswordChange}>
              Alterar Palavra-Passe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar Autenticação de Dois Fatores</DialogTitle>
            <DialogDescription>
              Adicione uma camada extra de segurança à sua conta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm mb-2">Digitalize este código QR com a sua aplicação de autenticação:</p>
              <div className="w-48 h-48 bg-white mx-auto flex items-center justify-center rounded">
                <div className="text-xs text-muted-foreground">[QR Code simulado]</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="2fa-code">Código de verificação</Label>
              <Input
                id="2fa-code"
                placeholder="000000"
                maxLength={6}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handle2FAEnable}>
              Ativar 2FA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
