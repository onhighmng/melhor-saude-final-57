import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music, ChevronUp, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMusic } from '@/contexts/MusicContext';

const MusicPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowPlayer, setShouldShowPlayer] = useState(false);
  
  const { 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    volume, 
    setVolume, 
    isMuted, 
    toggleMute,
    currentTrackName,
    isLoading,
    error
  } = useMusic();

  // Check if music player should be visible based on current page
  useEffect(() => {
    const checkMusicAvailability = () => {
      const currentPath = window.location.pathname;
      const patientPages = [
        '/user/dashboard',
        '/user/book',
        '/user/sessions',
        '/user/help',
        '/user/settings'
      ];
      
      const shouldShow = patientPages.some(page => currentPath.startsWith(page));
      setShouldShowPlayer(shouldShow);
    };

    checkMusicAvailability();
    
    // Listen for route changes
    window.addEventListener('popstate', checkMusicAvailability);
    
    return () => {
      window.removeEventListener('popstate', checkMusicAvailability);
    };
  }, []);

  // Don't render the player if music is not available on current page
  if (!shouldShowPlayer) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Collapsed State */}
      {!isExpanded && (
        <div className="relative group">
          {/* Tooltip hint */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsExpanded(true)}
                size="lg"
                className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 transition-all duration-500 hover:scale-110 group relative overflow-hidden"
              >
                {/* Background pulse animation */}
                <div className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-75" />
                <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse" />
                
                {/* Main icon with expand indicators */}
                <div className="relative z-10">
                  <Music className="h-6 w-6 transition-transform group-hover:scale-110" />
                  
                  {/* Expand chevron */}
                  <ChevronUp className="absolute -top-1 -right-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-bounce" />
                  
                  {/* More dots indicator */}
                  <MoreHorizontal className="absolute -bottom-1 -left-1 h-3 w-3 opacity-60 group-hover:opacity-100 transition-all duration-300" />
                  
                  {/* Status indicators */}
                  {isLoading && (
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-spin border-2 border-white" />
                  )}
                  {isPlaying && !isLoading && (
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white" />
                  )}
                  {error && (
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-400 rounded-full border-2 border-white" />
                  )}
                </div>
                
                {/* Ripple effect on hover */}
                <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/90 text-white border-none">
              <p className="text-sm">Click to expand music controls</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Floating text hint */}
          <div className="absolute -top-8 -left-8 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Music Controls
            </div>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <Card className="p-4 shadow-xl bg-card/95 backdrop-blur-sm border border-border/50 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={() => setIsExpanded(false)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full"
            >
              <Music className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground truncate max-w-32">
                {currentTrackName}
              </div>
              {isLoading && (
                <div className="text-xs text-muted-foreground">Loading...</div>
              )}
              {error && (
                <div className="text-xs text-red-500 truncate max-w-32">Audio error</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Button
              onClick={togglePlay}
              variant="outline"
              size="sm"
              className="h-8 w-8 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>

            <Button
              onClick={nextTrack}
              variant="outline"
              size="sm"
              className="h-8 w-8 rounded-full"
            >
              <SkipForward className="h-3 w-3" />
            </Button>

            <Button
              onClick={toggleMute}
              variant="outline"
              size="sm"
              className="h-8 w-8 rounded-full"
            >
              {isMuted ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="h-3 w-3 text-muted-foreground" />
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={(value) => setVolume(value[0] / 100)}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MusicPlayer;