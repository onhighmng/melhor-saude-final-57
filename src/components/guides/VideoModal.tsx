
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  guideName: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc, guideName }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl mx-auto px-4" 
           style={{ 
             paddingTop: '7rem',
             height: 'calc(100vh - 7rem)',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
           }}
           onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full bg-black rounded-lg overflow-hidden"
             style={{ 
               aspectRatio: '16/9',
               maxHeight: '100%',
               maxWidth: '100%'
             }}>
          <video
            width="100%"
            height="100%"
            controls
            autoPlay
            className="w-full h-full"
            style={{ objectFit: 'contain' }}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/50 rounded-full p-2 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close video</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
