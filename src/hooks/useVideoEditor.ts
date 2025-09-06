
import { useState } from 'react';

export const useVideoEditor = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(''); // Clear URL if file is selected
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoUrl('');
    setVideoDescription('');
  };

  const startEditing = () => setIsEditing(true);
  
  const cancelEditing = () => {
    setIsEditing(false);
    resetForm();
  };

  const buildRequestValue = () => {
    let newValue = '';
    
    if (videoFile) {
      newValue = `File: ${videoFile.name}`;
      if (videoDescription) {
        newValue += ` | Description: ${videoDescription}`;
      }
    } else if (videoUrl) {
      newValue = videoUrl;
      if (videoDescription) {
        newValue += ` | Description: ${videoDescription}`;
      }
    }

    return newValue;
  };

  return {
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
  };
};
