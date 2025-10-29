import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSave: (data: { name: string; phone: string; avatar_url?: string }) => void;
}

export const ProfileEditModal = ({ isOpen, onClose, profile, onSave }: ProfileEditModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    avatar_url: profile?.avatar_url || ""
  });
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um ficheiro de imagem válido",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "O ficheiro deve ter menos de 2MB",
          variant: "destructive"
        });
        return;
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProfileData({ ...profileData, avatar_url: publicUrl });

      toast({
        title: "Sucesso",
        description: "Foto de perfil carregada com sucesso"
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar a foto",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave(profileData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Informação do Perfil</h2>
              <p className="text-sm text-muted-foreground">Atualize as suas informações pessoais</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileData.avatar_url || profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {profile?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{profile?.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Button 
                    variant="link" 
                    className="px-0 h-auto mt-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        A carregar...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Alterar foto
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/50">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar alterações</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
