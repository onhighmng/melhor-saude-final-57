import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SecurePasswordInput } from "@/components/ui/secure-password-input";
import { X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validatePassword } from "@/utils/passwordValidation";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: () => void;
  onEnable2FA: () => void;
}

export const SecurityModal = ({ isOpen, onClose, onChangePassword, onEnable2FA }: SecurityModalProps) => {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    // Validate new password
    const validation = validatePassword(passwordData.new);
    if (!validation.isValid) {
      toast.error('Palavra-passe fraca', {
        description: validation.errors.join('. ')
      });
      return;
    }

    // Check if passwords match
    if (passwordData.new !== passwordData.confirm) {
      toast.error('As palavras-passe não coincidem');
      return;
    }

    // Check minimum fields
    if (!passwordData.new || !passwordData.confirm) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      toast.success('Palavra-passe alterada com sucesso');
      setShowPasswordDialog(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      onChangePassword();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar palavra-passe';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0" showClose={false} aria-describedby="security-description">
          <DialogTitle className="sr-only">Segurança & Acesso</DialogTitle>
          <DialogDescription id="security-description" className="sr-only">
            Gerir as definições de segurança da sua conta
          </DialogDescription>
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

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div>
                    <Label className="text-base">Autenticação de dois fatores (2FA)</Label>
                    <p className="text-sm text-muted-foreground">
                      Em breve estará disponível
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Brevemente
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
              <Label htmlFor="new-password">Nova palavra-passe</Label>
              <SecurePasswordInput
                value={passwordData.new}
                onChange={(value) => setPasswordData({ ...passwordData, new: value })}
                placeholder="Mínimo 12 caracteres"
                required
                showStrength={true}
                onValidationChange={(isValid, issues) => {
                  // Validation feedback handled by component
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova palavra-passe</Label>
              <SecurePasswordInput
                value={passwordData.confirm}
                onChange={(value) => setPasswordData({ ...passwordData, confirm: value })}
                placeholder="Repetir palavra-passe"
                required
                showStrength={false}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordDialog(false)}
              disabled={isChangingPassword}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'A alterar...' : 'Alterar Palavra-Passe'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};
