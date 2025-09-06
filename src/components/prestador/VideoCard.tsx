
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2 } from 'lucide-react';
import { Provider } from '@/types/provider';
import { useVideoEditor } from '@/hooks/useVideoEditor';
import VideoDisplay from './VideoDisplay';
import VideoEditForm from './VideoEditForm';

interface VideoCardProps {
  provider: Provider;
  onEditRequest: (field: string, fieldLabel: string, currentValue: string) => void;
}

const VideoCard = ({ provider, onEditRequest }: VideoCardProps) => {
  const {
    isEditing,
    videoFile,
    videoUrl,
    videoDescription,
    setVideoUrl,
    setVideoDescription,
    handleVideoUpload,
    startEditing,
    cancelEditing,
    resetForm,
    buildRequestValue
  } = useVideoEditor();

  const handleSubmitRequest = () => {
    const newValue = buildRequestValue();

    if (newValue) {
      onEditRequest('video', 'Vídeo de Apresentação', newValue);
      cancelEditing();
    }
  };

  const handleVideoUrlChange = (value: string) => {
    setVideoUrl(value);
    if (value) {
      // Clear file if URL is entered - this logic is handled in the hook
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-cool-grey/20">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold text-navy-blue">
          Vídeo de Apresentação
        </CardTitle>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={startEditing}
            className="text-royal-blue border-royal-blue hover:bg-royal-blue hover:text-white"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Solicitar Alteração
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isEditing ? (
          <VideoDisplay provider={provider} />
        ) : (
          <VideoEditForm
            videoFile={videoFile}
            videoUrl={videoUrl}
            videoDescription={videoDescription}
            onVideoUpload={handleVideoUpload}
            onVideoUrlChange={handleVideoUrlChange}
            onVideoDescriptionChange={setVideoDescription}
            onSubmit={handleSubmitRequest}
            onCancel={cancelEditing}
            isSubmitDisabled={!videoFile && !videoUrl}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default VideoCard;
