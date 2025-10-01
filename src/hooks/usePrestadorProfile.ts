import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Provider } from '@/types/provider';

export interface PrestadorProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profile_photo_url?: string;
  video_url?: string;
  calendly_link?: string;
  zoom_meeting_id?: string;
  pillar: string;
  specialties: string[];
  languages: string[];
  certifications: string[];
  hourly_rate?: number;
  session_duration: number;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

// Transform database prestador to Provider interface
const transformPrestadorToProvider = (prestador: PrestadorProfile): Provider => {
  return {
    id: prestador.id,
    name: prestador.name,
    photo: prestador.profile_photo_url || '/placeholder.svg',
    specialization: prestador.pillar || 'Geral',
    pillar: prestador.pillar,
    shortBio: prestador.bio?.substring(0, 150) + '...' || '',
    fullBio: prestador.bio || '',
    experience: prestador.certifications.join(', ') || '',
    education: prestador.certifications || [],
    specialties: prestador.specialties || [],
    activeCases: 0,
    videoUrl: prestador.video_url,
    videoDescription: 'Apresentação do prestador'
  };
};

export const usePrestadorProfile = () => {
  const { user, profile } = useAuth();
  const [prestadorProfile, setPrestadorProfile] = useState<PrestadorProfile | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrestadorProfile = async () => {
      if (!user || profile?.role !== 'prestador') {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching prestador profile for user:', user.id);
        
        const { data, error } = await supabase
          .from('prestadores')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching prestador profile:', error);
          setError(error.message);
        } else {
          console.log('✅ Prestador profile fetched:', data);
          setPrestadorProfile(data);
          setProvider(transformPrestadorToProvider(data));
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        setError('Failed to fetch prestador profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPrestadorProfile();
  }, [user, profile]);

  return {
    prestadorProfile,
    provider, // Transformed data for UI components
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-trigger the effect by updating a dependency
    }
  };
};