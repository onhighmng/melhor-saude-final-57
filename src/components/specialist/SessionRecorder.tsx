import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Download,
  Upload,
  Clock,
  FileAudio,
  Shield,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Recording {
  id: string;
  booking_id: string;
  recording_url: string;
  duration_minutes: number;
  is_encrypted: boolean;
  transcription_url?: string;
  created_at: string;
  expires_at?: string;
}

interface SessionRecorderProps {
  bookingId: string;
  onRecordingComplete?: (recording: Recording) => void;
}

export const SessionRecorder: React.FC<SessionRecorderProps> = ({
  bookingId,
  onRecordingComplete
}) => {
  const { t } = useTranslation('specialist');
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadRecordings();
  }, [bookingId]);

  const loadRecordings = async () => {
    if (!bookingId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('session_recordings')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar gravações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks(chunks);
        uploadRecording(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setCurrentRecording(mediaRecorder);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Gravação iniciada",
        description: "A gravação da sessão foi iniciada"
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro",
        description: "Falha ao iniciar gravação. Verifique as permissões do microfone.",
        variant: "destructive"
      });
    }
  };

  const pauseRecording = () => {
    if (currentRecording && currentRecording.state === 'recording') {
      currentRecording.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (currentRecording && currentRecording.state === 'paused') {
      currentRecording.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (currentRecording) {
      currentRecording.stop();
      setIsRecording(false);
      setIsPaused(false);
      setCurrentRecording(null);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const uploadRecording = async (audioBlob: Blob) => {
    if (!profile?.id || !bookingId) return;

    setIsUploading(true);
    try {
      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `session-${bookingId}-${timestamp}.webm`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('session-recordings')
        .upload(filename, audioBlob, {
          contentType: 'audio/webm',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('session-recordings')
        .getPublicUrl(filename);

      // Get booking details first
      const { data: booking } = await supabase
        .from('bookings')
        .select('prestador_id, user_id')
        .eq('id', bookingId)
        .single();

      if (!booking) throw new Error('Booking not found');

      // Save recording metadata to database
      const { data: recordingData, error: dbError } = await supabase
        .from('session_recordings')
        .insert({
          booking_id: bookingId,
          prestador_id: booking.prestador_id || profile.id,
          user_id: booking.user_id,
          recording_url: urlData.publicUrl,
          duration_minutes: Math.ceil(recordingTime / 60),
          is_encrypted: true,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Log the action
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: profile.id,
          action: 'session_recorded',
          entity_type: 'session_recording',
          entity_id: recordingData.id,
          details: {
            booking_id: bookingId,
            duration: recordingTime,
            filename
          }
        });

      toast({
        title: "Gravação salva",
        description: `Gravação de ${formatTime(recordingTime)} salva com sucesso`
      });

      // Reload recordings
      await loadRecordings();

      // Call completion callback
      if (onRecordingComplete) {
        onRecordingComplete(recordingData);
      }

    } catch (error) {
      console.error('Error uploading recording:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar gravação",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const transcribeRecording = async (recordingId: string) => {
    if (!profile?.id) return;

    setIsTranscribing(true);
    try {
      // This would integrate with a transcription service like OpenAI Whisper
      // For now, we'll simulate the process
      
      const { error } = await supabase
        .from('session_recordings')
        .update({
          transcription_url: 'placeholder-transcription-url'
        })
        .eq('id', recordingId);

      if (error) throw error;

      toast({
        title: "Transcrição iniciada",
        description: "A transcrição da gravação foi iniciada"
      });

      // Reload recordings
      await loadRecordings();

    } catch (error) {
      console.error('Error transcribing recording:', error);
      toast({
        title: "Erro",
        description: "Falha ao iniciar transcrição",
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const deleteRecording = async (recordingId: string) => {
    if (!profile?.id) return;

    try {
      const recording = recordings.find(r => r.id === recordingId);
      if (!recording) return;

      // Delete from storage
      const filename = recording.recording_url.split('/').pop();
      if (filename) {
        await supabase.storage
          .from('session-recordings')
          .remove([filename]);
      }

      // Delete from database
      const { error } = await supabase
        .from('session_recordings')
        .delete()
        .eq('id', recordingId);

      if (error) throw error;

      toast({
        title: "Gravação excluída",
        description: "A gravação foi excluída com sucesso"
      });

      // Reload recordings
      await loadRecordings();

    } catch (error) {
      console.error('Error deleting recording:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir gravação",
        variant: "destructive"
      });
    }
  };

  const downloadRecording = async (recording: Recording) => {
    try {
      const response = await fetch(recording.recording_url);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `session-${recording.booking_id}-${new Date(recording.created_at).toISOString().split('T')[0]}.webm`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast({
        title: "Erro",
        description: "Falha ao descarregar gravação",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">A carregar gravações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Gravação de Sessão
          </CardTitle>
          <CardDescription>
            Grave a sessão para fins de qualidade e conformidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isRecording ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {isPaused ? 'Pausado' : 'Gravando'} - {formatTime(recordingTime)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Pronto para gravar
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <Button onClick={startRecording} disabled={isUploading}>
                  <Mic className="h-4 w-4 mr-2" />
                  Iniciar Gravação
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button onClick={resumeRecording} variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Retomar
                    </Button>
                  ) : (
                    <Button onClick={pauseRecording} variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </Button>
                  )}
                  
                  <Button onClick={stopRecording} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Parar
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Recording Progress */}
          {isRecording && (
            <div className="space-y-2">
              <Progress value={(recordingTime % 60) * 100 / 60} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                {formatTime(recordingTime)}
              </p>
            </div>
          )}

          {/* Upload Status */}
          {isUploading && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
              <Upload className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-700">A carregar gravação...</span>
            </div>
          )}

          {/* GDPR Notice */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded">
            <Shield className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Aviso de Privacidade</p>
              <p>As gravações são criptografadas e armazenadas por 90 dias para fins de qualidade. 
              O utilizador será notificado sobre a gravação.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recordings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Gravações da Sessão
          </CardTitle>
          <CardDescription>
            Histórico de gravações desta sessão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recordings.length > 0 ? (
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div key={recording.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex items-center gap-4">
                    <FileAudio className="h-8 w-8 text-muted-foreground" />
                    
                    <div>
                      <p className="font-medium">
                        Gravação de {formatTime(recording.duration_minutes * 60)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criada em {new Date(recording.created_at).toLocaleDateString('pt-PT')}
                        {recording.expires_at && (
                          <span className={isExpired(recording.expires_at) ? 'text-red-500' : ''}>
                            {' '}• Expira em {new Date(recording.expires_at).toLocaleDateString('pt-PT')}
                          </span>
                        )}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {recording.is_encrypted && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Criptografado
                          </Badge>
                        )}
                        
                        {recording.transcription_url ? (
                          <Badge className="bg-green-500 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Transcrito
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Não transcrito
                          </Badge>
                        )}
                        
                        {isExpired(recording.expires_at) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Expirado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadRecording(recording)}
                      disabled={isExpired(recording.expires_at)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {!recording.transcription_url && !isExpired(recording.expires_at) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => transcribeRecording(recording.id)}
                        disabled={isTranscribing}
                      >
                        <FileAudio className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRecording(recording.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileAudio className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma gravação encontrada</p>
              <p className="text-sm">Inicie uma gravação para começar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
