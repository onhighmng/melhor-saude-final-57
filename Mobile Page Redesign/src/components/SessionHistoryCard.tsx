import { Calendar, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SessionHistoryCardProps {
  imageUrl: string;
}

export function SessionHistoryCard({ imageUrl }: SessionHistoryCardProps) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative h-48 rounded-3xl overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt="Recursos de terapia"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
          <div className="flex items-center gap-2 text-white">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>Recursos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
