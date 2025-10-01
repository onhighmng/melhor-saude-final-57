
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Provider } from '@/types/provider';

interface VideoSectionProps {
  provider: Partial<Provider>;
  onChange: (updates: Partial<Provider>) => void;
}

const VideoSection = ({ provider, onChange }: VideoSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-navy-blue">Vídeo de Apresentação</h3>
      <div>
        <Label htmlFor="videoUrl">URL do Vídeo</Label>
        <Input
          id="videoUrl"
          value={provider.videoUrl || ''}
          onChange={(e) => onChange({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v="
        />
      </div>
      <div>
        <Label htmlFor="videoDescription">Descrição do Vídeo</Label>
        <Textarea
          id="videoDescription"
          value={provider.videoDescription || ''}
          onChange={(e) => onChange({ videoDescription: e.target.value })}
          placeholder="Descrição opcional do vídeo de apresentação"
          rows={2}
        />
      </div>
    </div>
  );
};

export default VideoSection;
