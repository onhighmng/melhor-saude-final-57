import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
  togglePlay: () => void;
  nextTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  currentTrackName: string;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const tracks = [
  {
    src: '/WhatsApp Audio 2025-07-19 at 14.52.24_8e071aa1.mp3',
    name: 'Relaxing Ambience 1'
  },
  {
    src: '/WhatsApp Audio 2025-07-19 at 14.52.40_284ba36b.mp3',
    name: 'Relaxing Ambience 2'
  },
  {
    src: '/WhatsApp Audio 2025-07-19 at 14.52.53_23df9e81.mp3',
    name: 'Relaxing Ambience 3'
  }
];

// Configure which pages have music access for each user interface
const musicEnabledByInterface = {
  // Patient/User interface pages
  patient: [
    '/user/dashboard',
    '/user/book',
    '/user/sessions',
    '/user/help',
    '/user/settings'
  ],
  // Admin interface pages
  admin: [
    '/admin'
  ],
  // Prestador interface pages  
  prestador: [
    '/prestador-dashboard'
  ],
  // Company/HR interface pages
  company: [
    '/company/dashboard'
  ],
  // Public pages (accessible to all)
  public: [
    '/'
  ]
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolumeState] = useState(0.05); // 5% initial volume
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Debug function
  const debug = useCallback((message: string, data?: any) => {
    console.log(`[Music Debug] ${message}`, data || '');
  }, []);

  // Clear any ongoing fade effects
  const clearFade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  // Initialize audio element with full error handling
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    debug('Initializing audio system');
    
    try {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.volume = 0;
      audio.loop = false;
      
      // Add comprehensive event listeners
      audio.addEventListener('loadstart', () => {
        debug('Audio loading started');
        setIsLoading(true);
        setError(null);
      });
      
      audio.addEventListener('loadedmetadata', () => {
        debug('Audio metadata loaded');
      });
      
      audio.addEventListener('canplaythrough', () => {
        debug('Audio can play through');
        setIsLoading(false);
      });
      
      audio.addEventListener('error', (e) => {
        const errorMsg = `Audio error: ${audio.error?.message || 'Unknown error'}`;
        debug(errorMsg);
        setError(errorMsg);
        setIsLoading(false);
        setIsPlaying(false);
      });
      
      audio.addEventListener('ended', () => {
        debug('Track ended, checking if should continue playing');
        if (shouldPlayMusic()) {
          debug('Moving to next track');
          nextTrack();
        } else {
          debug('Not on music-enabled page, stopping playback');
          setIsPlaying(false);
        }
      });
      
      audio.addEventListener('play', () => {
        debug('Audio play event fired');
        setIsPlaying(true);
      });
      
      audio.addEventListener('pause', () => {
        debug('Audio pause event fired');
        setIsPlaying(false);
      });
      
      audioRef.current = audio;
      isInitializedRef.current = true;
      
      debug('Audio system initialized successfully');
    } catch (error) {
      const errorMsg = `Failed to initialize audio: ${error}`;
      debug(errorMsg);
      setError(errorMsg);
    }

    return () => {
      clearFade();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeEventListener('loadstart', () => {});
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('canplaythrough', () => {});
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('play', () => {});
        audioRef.current.removeEventListener('pause', () => {});
      }
    };
  }, [debug, clearFade]);

  // Check if current page should have music - only patient interfaces
  const shouldPlayMusic = useCallback(() => {
    const currentPath = window.location.pathname;
    
    // Only allow music on patient interface pages  
    const shouldPlay = musicEnabledByInterface.patient.some(page => 
      currentPath.startsWith(page)
    );
    
    debug(`Page check: ${currentPath}, should play: ${shouldPlay}`);
    return shouldPlay;
  }, [debug]);

  // Handle page navigation
  useEffect(() => {
    const handleRouteChange = () => {
      if (!shouldPlayMusic() && isPlaying) {
        debug('Route changed to non-music page, pausing');
        pauseMusic();
      }
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Check current location
    handleRouteChange();

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isPlaying, shouldPlayMusic, debug]);

  // Smooth volume fade effect
  const fadeVolume = useCallback((targetVolume: number, onComplete?: () => void) => {
    if (!audioRef.current) return;
    
    clearFade();
    
    const currentVolume = audioRef.current.volume;
    const step = (targetVolume - currentVolume) / 20; // 20 steps for smooth transition
    
    debug(`Fading volume from ${currentVolume} to ${targetVolume}`);
    
    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) {
        clearFade();
        return;
      }
      
      const newVolume = audioRef.current.volume + step;
      
      if ((step > 0 && newVolume >= targetVolume) || (step < 0 && newVolume <= targetVolume)) {
        audioRef.current.volume = Math.max(0, Math.min(1, targetVolume));
        clearFade();
        onComplete?.();
      } else {
        audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
      }
    }, 50);
  }, [clearFade, debug]);

  // Load and prepare track
  const loadTrack = useCallback(async (trackIndex: number): Promise<boolean> => {
    if (!audioRef.current) return false;
    
    const track = tracks[trackIndex];
    debug(`Loading track ${trackIndex}: ${track.name}`);
    
    setIsLoading(true);
    setError(null);
    
    try {
      audioRef.current.src = track.src;
      
      // Wait for the track to be ready
      await new Promise((resolve, reject) => {
        if (!audioRef.current) return reject(new Error('Audio element not available'));
        
        const handleCanPlay = () => {
          audioRef.current?.removeEventListener('canplaythrough', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          resolve(true);
        };
        
        const handleError = () => {
          audioRef.current?.removeEventListener('canplaythrough', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          reject(new Error('Failed to load track'));
        };
        
        audioRef.current.addEventListener('canplaythrough', handleCanPlay);
        audioRef.current.addEventListener('error', handleError);
        
        // Trigger load
        audioRef.current.load();
      });
      
      debug(`Track ${trackIndex} loaded successfully`);
      setIsLoading(false);
      return true;
    } catch (error) {
      const errorMsg = `Failed to load track ${trackIndex}: ${error}`;
      debug(errorMsg);
      setError(errorMsg);
      setIsLoading(false);
      return false;
    }
  }, [debug]);

  // Start playing music
  const startMusic = useCallback(async () => {
    if (!audioRef.current || !hasUserInteracted) return false;
    
    debug('Starting music playback');
    
    try {
      const loaded = await loadTrack(currentTrack);
      if (!loaded) return false;
      
      audioRef.current.volume = 0;
      await audioRef.current.play();
      
      const targetVolume = isMuted ? 0 : volume;
      fadeVolume(targetVolume);
      
      debug('Music started successfully');
      return true;
    } catch (error) {
      const errorMsg = `Failed to start music: ${error}`;
      debug(errorMsg);
      setError(errorMsg);
      setIsPlaying(false);
      return false;
    }
  }, [currentTrack, hasUserInteracted, isMuted, volume, loadTrack, fadeVolume, debug]);

  // Resume music playback
  const resumeMusic = useCallback(async () => {
    if (!audioRef.current || !hasUserInteracted) return false;
    
    debug('Resuming music playback');
    
    try {
      if (audioRef.current.paused) {
        await audioRef.current.play();
        const targetVolume = isMuted ? 0 : volume;
        fadeVolume(targetVolume);
        debug('Music resumed successfully');
        return true;
      }
      return false;
    } catch (error) {
      const errorMsg = `Failed to resume music: ${error}`;
      debug(errorMsg);
      setError(errorMsg);
      setIsPlaying(false);
      return false;
    }
  }, [hasUserInteracted, isMuted, volume, fadeVolume, debug]);

  // Pause music playback
  const pauseMusic = useCallback(() => {
    if (!audioRef.current || audioRef.current.paused) return;
    
    debug('Pausing music');
    
    fadeVolume(0, () => {
      if (audioRef.current) {
        audioRef.current.pause();
        debug('Music paused successfully');
      }
    });
  }, [fadeVolume, debug]);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    debug(`Toggle play - current state: ${isPlaying}, user interacted: ${hasUserInteracted}`);
    
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    
    if (isPlaying) {
      pauseMusic();
    } else {
      if (!audioRef.current?.src || audioRef.current.src !== tracks[currentTrack].src) {
        await startMusic();
      } else {
        await resumeMusic();
      }
    }
  }, [isPlaying, hasUserInteracted, currentTrack, startMusic, resumeMusic, pauseMusic, debug]);

  // Skip to next track
  const nextTrack = useCallback(async () => {
    debug('Skipping to next track');
    
    const nextIndex = (currentTrack + 1) % tracks.length;
    setCurrentTrack(nextIndex);
    
    if (isPlaying && hasUserInteracted) {
      debug(`Moving from track ${currentTrack} to ${nextIndex}`);
      
      fadeVolume(0, async () => {
        const success = await loadTrack(nextIndex);
        if (success && audioRef.current) {
          try {
            await audioRef.current.play();
            const targetVolume = isMuted ? 0 : volume;
            fadeVolume(targetVolume);
          } catch (error) {
            debug(`Failed to play next track: ${error}`);
            setIsPlaying(false);
          }
        }
      });
    }
  }, [currentTrack, isPlaying, hasUserInteracted, isMuted, volume, loadTrack, fadeVolume, debug]);

  // Set volume with proper state management
  const setVolume = useCallback((newVolume: number) => {
    debug(`Setting volume to ${newVolume}`);
    
    setVolumeState(newVolume);
    
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  }, [isMuted, debug]);

  // Toggle mute state
  const toggleMute = useCallback(() => {
    debug(`Toggling mute - current state: ${isMuted}`);
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (audioRef.current) {
      const targetVolume = newMutedState ? 0 : volume;
      fadeVolume(targetVolume);
    }
  }, [isMuted, volume, fadeVolume, debug]);

  const value: MusicContextType = {
    isPlaying,
    currentTrack,
    volume,
    isMuted,
    isLoading,
    error,
    togglePlay,
    nextTrack,
    setVolume,
    toggleMute,
    currentTrackName: tracks[currentTrack].name,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};