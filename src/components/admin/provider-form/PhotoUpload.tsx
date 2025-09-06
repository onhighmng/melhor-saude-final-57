import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const PhotoUpload = ({ value, onChange }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas ficheiros de imagem.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('O ficheiro deve ter menos de 5MB.');
      return;
    }

    setUploading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'prestador-photo');
      formData.append('isPublic', 'true');

      // Upload to Supabase function
      const { data, error } = await supabase.functions.invoke('upload-photo', {
        body: formData,
      });

      if (error) throw error;

      if (data?.success && data?.file?.url) {
        const imageUrl = data.file.url;
        setPreview(imageUrl);
        onChange(imageUrl);
      } else {
        throw new Error('Failed to get upload URL');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label>Foto de Perfil</Label>
      
      {preview ? (
        <div className="relative">
          <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemovePhoto}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Sem foto</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'A fazer upload...' : 'Selecionar Foto'}
      </Button>
      
      <p className="text-xs text-gray-500">
        Formatos suportados: JPG, PNG, WebP. Máximo 5MB.
      </p>
    </div>
  );
};

export default PhotoUpload;