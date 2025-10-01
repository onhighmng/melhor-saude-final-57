
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link as LinkIcon } from 'lucide-react';

interface VideoEditFormProps {
  videoFile: File | null;
  videoUrl: string;
  videoDescription: string;
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoUrlChange: (value: string) => void;
  onVideoDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitDisabled: boolean;
}

const VideoEditForm = ({
  videoFile,
  videoUrl,
  videoDescription,
  onVideoUpload,
  onVideoUrlChange,
  onVideoDescriptionChange,
  onSubmit,
  onCancel,
  isSubmitDisabled
}: VideoEditFormProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-navy-blue">
            Carregar Arquivo de Vídeo
          </Label>
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={onVideoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-3 p-4 border-2 border-dashed border-cool-grey/30 rounded-lg hover:border-royal-blue/50 transition-colors">
              <Upload className="w-5 h-5 text-royal-blue" />
              <div className="flex-1">
                {videoFile ? (
                  <p className="text-sm text-navy-blue">{videoFile.name}</p>
                ) : (
                  <p className="text-sm text-cool-grey">
                    Clique para escolher um arquivo de vídeo
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <span className="text-sm text-cool-grey">ou</span>
        </div>

        <div className="space-y-3">
          <Label htmlFor="videoUrl" className="text-sm font-medium text-navy-blue">
            URL do Vídeo (YouTube, Vimeo, etc.)
          </Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cool-grey" />
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v="
              value={videoUrl}
              onChange={(e) => onVideoUrlChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="videoDescription" className="text-sm font-medium text-navy-blue">
            Descrição do Vídeo (Opcional)
          </Label>
          <Textarea
            id="videoDescription"
            placeholder="Descreva brevemente o conteúdo do vídeo..."
            value={videoDescription}
            onChange={(e) => onVideoDescriptionChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-cool-grey/20">
        <Button
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="bg-royal-blue hover:bg-navy-blue text-white"
        >
          Submeter Solicitação
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-cool-grey text-navy-blue hover:bg-cool-grey/10"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default VideoEditForm;
