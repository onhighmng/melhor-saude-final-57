
import React from 'react';
import { Video } from 'lucide-react';
import { Provider } from '@/types/provider';

interface VideoDisplayProps {
  provider: Provider;
}

const VideoDisplay = ({ provider }: VideoDisplayProps) => {
  if (provider.videoUrl) {
    return (
      <div className="space-y-3">
        <div className="aspect-video bg-cool-grey/10 rounded-lg overflow-hidden">
          {provider.videoUrl.includes('youtube.com') || provider.videoUrl.includes('youtu.be') ? (
            <iframe
              src={provider.videoUrl.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allowFullScreen
              title="Vídeo de Apresentação"
            />
          ) : (
            <video
              src={provider.videoUrl}
              controls
              className="w-full h-full object-cover"
            >
              O seu navegador não suporta o elemento de vídeo.
            </video>
          )}
        </div>
        {provider.videoDescription && (
          <p className="text-sm text-navy-blue opacity-80">
            {provider.videoDescription}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-32 bg-cool-grey/10 rounded-lg border-2 border-dashed border-cool-grey/30">
      <div className="text-center">
        <Video className="w-8 h-8 mx-auto mb-2 text-cool-grey" />
        <p className="text-sm text-cool-grey">
          Nenhum vídeo carregado
        </p>
      </div>
    </div>
  );
};

export default VideoDisplay;
