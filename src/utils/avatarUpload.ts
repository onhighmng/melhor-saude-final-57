import { supabase } from '@/integrations/supabase/client';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadAvatar = async (
  userId: string,
  file: File
): Promise<UploadResult> => {
  try {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Formato de arquivo inválido. Use JPG, PNG ou WEBP.',
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB.',
      };
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    // Delete old avatar if exists
    const { data: existingFiles } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from('avatars').remove(filesToDelete);
    }

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

    return {
      success: true,
      url: data.publicUrl,
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    return {
      success: false,
      error: 'Erro ao fazer upload do avatar. Tente novamente.',
    };
  }
};
