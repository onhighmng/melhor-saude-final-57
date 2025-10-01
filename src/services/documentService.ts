import { supabase } from '@/integrations/supabase/client';

export interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  created_at: string;
  file_category: string;
  metadata?: any;
}

class DocumentService {
  async uploadDocument(file: File, category: string = 'receipt'): Promise<Document | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${category}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // Save file record to database
      const { data: fileRecord, error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          stored_filename: fileName,
          file_path: uploadData.path,
          file_type: file.type,
          file_size: file.size,
          file_category: category,
          bucket_name: 'documents',
          public_url: publicUrl,
          is_public: false,
          metadata: { uploadedAt: new Date().toISOString() }
        })
        .select()
        .maybeSingle();

      if (dbError) throw dbError;

      return {
        id: fileRecord.id,
        name: fileRecord.original_filename,
        file_type: fileRecord.file_type,
        file_size: fileRecord.file_size,
        public_url: fileRecord.public_url,
        created_at: fileRecord.created_at,
        file_category: fileRecord.file_category,
        metadata: fileRecord.metadata
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  async getUserDocuments(category?: string): Promise<Document[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('file_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('file_category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(file => ({
        id: file.id,
        name: file.original_filename,
        file_type: file.file_type,
        file_size: file.file_size,
        public_url: file.public_url,
        created_at: file.created_at,
        file_category: file.file_category,
        metadata: file.metadata
      })) || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get file info first
      const { data: fileInfo, error: fetchError } = await supabase
        .from('file_uploads')
        .select('file_path, bucket_name, user_id')
        .eq('id', documentId)
        .maybeSingle();

      if (fetchError || !fileInfo || fileInfo.user_id !== user.id) {
        return false;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(fileInfo.bucket_name)
        .remove([fileInfo.file_path]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  async getDocumentDownloadUrl(documentId: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: fileInfo, error } = await supabase
        .from('file_uploads')
        .select('file_path, bucket_name, user_id')
        .eq('id', documentId)
        .maybeSingle();

      if (error || !fileInfo || fileInfo.user_id !== user.id) {
        return null;
      }

      const { data } = await supabase.storage
        .from(fileInfo.bucket_name)
        .createSignedUrl(fileInfo.file_path, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error getting download URL:', error);
      return null;
    }
  }
}

export const documentService = new DocumentService();