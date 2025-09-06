
import { useState, useEffect } from 'react';
import { Provider } from '@/types/provider';
import { supabase } from '@/integrations/supabase/client';

export const useProviders = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProvider, setNewProvider] = useState<Partial<Provider>>({
    name: '',
    specialization: '',
    shortBio: '',
    fullBio: '',
    experience: '',
    photo: '',
    education: [''],
    specialties: [''],
    activeCases: 0,
    videoUrl: '',
    videoDescription: ''
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('prestadores')
        .select('*')
        .eq('is_active', true)
        .eq('is_approved', true);

      if (error) {
        console.error('Error fetching providers:', error);
        return;
      }

      // Transform prestadores data to Provider format
      const transformedProviders: Provider[] = (data || []).map(prestador => ({
        id: prestador.id,
        name: prestador.name,
        photo: prestador.profile_photo_url || '/placeholder.svg',
        specialization: prestador.specialties?.[0] || '',
        shortBio: prestador.bio ? prestador.bio.substring(0, 100) + '...' : '',
        fullBio: prestador.bio || '',
        experience: '',
        education: prestador.certifications || [],
        specialties: prestador.specialties || [],
        activeCases: 0,
        videoUrl: prestador.video_url || '',
        videoDescription: ''
      }));

      setProviders(transformedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    if (isCreating && newProvider.name) {
      try {
        const { data, error } = await supabase
          .from('prestadores')
          .insert({
            name: newProvider.name,
            email: '',
            bio: newProvider.fullBio,
            profile_photo_url: newProvider.photo,
            video_url: newProvider.videoUrl,
            specialties: newProvider.specialties,
            certifications: newProvider.education,
            is_active: true,
            is_approved: false // Requires admin approval
          })
          .select()
          .maybeSingle();

        if (error) {
          console.error('Error creating provider:', error);
          return;
        }

        // Refresh the providers list
        await fetchProviders();
        setIsCreating(false);
        resetNewProvider();
      } catch (error) {
        console.error('Error saving provider:', error);
      }
    }
  };

  const handleUpdateProvider = async () => {
    if (editingProvider) {
      try {
        const { error } = await supabase
          .from('prestadores')
          .update({
            name: editingProvider.name,
            bio: editingProvider.fullBio,
            profile_photo_url: editingProvider.photo,
            video_url: editingProvider.videoUrl,
            specialties: editingProvider.specialties,
            certifications: editingProvider.education
          })
          .eq('id', editingProvider.id);

        if (error) {
          console.error('Error updating provider:', error);
          return;
        }

        // Refresh the providers list
        await fetchProviders();
        setEditingProvider(null);
      } catch (error) {
        console.error('Error updating provider:', error);
      }
    }
  };

  const handleEditingProviderChange = (updates: Partial<Provider>) => {
    if (editingProvider) {
      setEditingProvider({ ...editingProvider, ...updates });
    }
  };

  const resetNewProvider = () => {
    setNewProvider({
      name: '', specialization: '', shortBio: '', fullBio: '', experience: '',
      photo: '', education: [''], specialties: [''], 
      activeCases: 0, videoUrl: '', videoDescription: ''
    });
  };

  const startCreating = () => setIsCreating(true);
  
  const cancelCreating = () => {
    setIsCreating(false);
    resetNewProvider();
  };

  const cancelEditing = () => setEditingProvider(null);

  return {
    providers,
    loading,
    editingProvider,
    isCreating,
    newProvider,
    setNewProvider,
    setEditingProvider,
    handleSaveProvider,
    handleUpdateProvider,
    handleEditingProviderChange,
    startCreating,
    cancelCreating,
    cancelEditing,
    fetchProviders
  };
};
