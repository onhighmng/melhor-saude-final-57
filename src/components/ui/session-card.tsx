import React from 'react'
import { Calendar, Clock, User, Building, Video, Phone, MapPin, ExternalLink, RotateCcw, X, Brain, Dumbbell, DollarSign, Scale, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface SessionCardData {
  id: string
  pillar: string
  date: string
  time: string
  duration?: number
  prestador: string
  meetingType: 'virtual' | 'presencial' | 'phone'
  meetingPlatform?: string
  meetingLink?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  quota: string
}

interface SessionCardProps {
  session: SessionCardData
  onReschedule?: (sessionId: string) => void
  onJoin?: (sessionId: string) => void
  onCancel?: (sessionId: string) => void
  className?: string
}

const getPillarColors = (pillar: string) => {
  const colors = {
    'saude_mental': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      bgSolid: 'bg-blue-500',
      hoverBg: 'hover:from-blue-600 hover:to-blue-800'
    },
    'bem_estar_fisico': {
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      bgSolid: 'bg-yellow-500',
      hoverBg: 'hover:from-yellow-600 hover:to-yellow-800'
    },
    'assistencia_financeira': {
      bg: 'bg-green-50',
      border: 'border-green-200', 
      text: 'text-green-700',
      bgSolid: 'bg-green-500',
      hoverBg: 'hover:from-green-600 hover:to-green-800'
    },
    'assistencia_juridica': {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700', 
      bgSolid: 'bg-purple-500',
      hoverBg: 'hover:from-purple-600 hover:to-purple-800'
    }
  }
  return colors[pillar as keyof typeof colors] || colors['saude_mental']
}

const getPillarIcon = (pillar: string) => {
  switch (pillar) {
    case 'saude_mental':
      return Brain
    case 'bem_estar_fisico':
      return Dumbbell
    case 'assistencia_financeira':
      return DollarSign
    case 'assistencia_juridica':
      return Scale
    default:
      return Brain
  }
}

const getPillarName = (pillar: string) => {
  const names = {
    'saude_mental': 'Saúde Mental',
    'bem_estar_fisico': 'Bem-Estar Físico', 
    'assistencia_financeira': 'Assistência Financeira',
    'assistencia_juridica': 'Assistência Jurídica'
  }
  return names[pillar as keyof typeof names] || pillar
}

const getMeetingIcon = (meetingType: string) => {
  switch (meetingType) {
    case 'virtual':
      return Video
    case 'presencial':
      return MapPin
    case 'phone':
      return Phone
    default:
      return Video
  }
}

const getMeetingLabel = (meetingType: string, platform?: string) => {
  switch (meetingType) {
    case 'virtual':
      if (platform) {
        // Replace underscores with spaces and capitalize properly
        return platform.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      return 'Virtual'
    case 'presencial':
      return 'Presencial'
    case 'phone':
      return 'Telefonema'
    default:
      return 'Virtual'
  }
}

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function SessionCard({ 
  session, 
  onReschedule, 
  onJoin, 
  onCancel, 
  className 
}: SessionCardProps) {
  const colors = getPillarColors(session.pillar)
  const MeetingIcon = getMeetingIcon(session.meetingType)
  const meetingLabel = getMeetingLabel(session.meetingType, session.meetingPlatform)
  const PillarIcon = getPillarIcon(session.pillar)

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 p-6 w-80 shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)] dark:shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(255,255,255,0.1)] transition-all duration-500 hover:shadow-[20px_20px_40px_rgba(0,0,0,0.2),-20px_-20px_40px_rgba(255,255,255,1)] dark:hover:shadow-[20px_20px_40px_rgba(0,0,0,0.4),-20px_-20px_40px_rgba(255,255,255,0.15)] hover:scale-105 hover:-translate-y-2',
      className
    )}>
      
      {/* Pillar Icon with enhanced hover effects */}
      <div className="mb-4 flex justify-center relative z-10">
        <div className="relative group-hover:animate-pulse">
          <div className={cn(
            "h-28 w-28 overflow-hidden rounded-full p-1 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] dark:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.3),inset_-6px_-6px_12px_rgba(255,255,255,0.1)] transition-all duration-500 group-hover:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.15),inset_-8px_-8px_16px_rgba(255,255,255,1)] dark:group-hover:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.4),inset_-8px_-8px_16px_rgba(255,255,255,0.15)] group-hover:scale-110 flex items-center justify-center",
            colors.bgSolid
          )}>
            <PillarIcon className="h-12 w-12 text-white transition-transform duration-500 group-hover:scale-105" />
          </div>
          {/* Glowing ring on hover */}
          <div className={cn("absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse", colors.border)}></div>
        </div>
      </div>

      {/* Session Info with slide-up animation */}
      <div className="text-center relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
        <h3 className={cn("text-lg font-semibold transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400", colors.text)}>
          {getPillarName(session.pillar)}
        </h3>
        
        {/* Session Details - Horizontal layout with larger text */}
        <div className="mt-4 flex flex-wrap justify-center items-center gap-4 text-lg text-gray-800 dark:text-gray-200 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">{formatDate(session.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-medium">{session.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="font-medium">{session.prestador}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MeetingIcon className="h-5 w-5" />
            <span className="font-medium">{meetingLabel}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons with light tones */}
      <div className="mt-6 flex gap-2 relative z-10">
        <button 
          onClick={() => onReschedule?.(session.id)}
          className="flex-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-2 text-sm font-medium shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Reagendar
        </button>
        
        <button 
          onClick={() => onJoin?.(session.id)}
          disabled={!session.meetingLink}
          className="flex-1 rounded-full bg-green-100 hover:bg-green-200 text-green-700 py-3 px-2 text-sm font-medium shadow-md transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-100"
        >
          Entrar
        </button>
        
        <button 
          onClick={() => onCancel?.(session.id)}
          className="flex-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 py-3 px-2 text-sm font-medium shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Cancelar
        </button>
      </div>

      {/* Animated border on hover */}
      <div className={cn("absolute inset-0 rounded-3xl border opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", colors.border)}></div>
    </div>
  )
}

// History Session Card Component for past sessions
export interface HistorySessionCardProps {
  session: {
    id: string
    pillar: string
    date: string
    time: string
    prestadorName: string
    meetingPlatform?: string
    meetingType?: 'virtual' | 'presencial' | 'phone'
    status: string
  }
  onRate?: (sessionId: string) => void
  className?: string
}

export function HistorySessionCard({ 
  session, 
  onRate, 
  className 
}: HistorySessionCardProps) {
  const colors = getPillarColors(session.pillar)
  const PillarIcon = getPillarIcon(session.pillar)
  const MeetingIcon = getMeetingIcon(session.meetingType || 'virtual')
  const meetingLabel = getMeetingLabel(session.meetingType || 'virtual', session.meetingPlatform)

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800 p-6 w-80 shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)] dark:shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(255,255,255,0.1)] transition-all duration-500 hover:shadow-[20px_20px_40px_rgba(0,0,0,0.2),-20px_-20px_40px_rgba(255,255,255,1)] dark:hover:shadow-[20px_20px_40px_rgba(0,0,0,0.4),-20px_-20px_40px_rgba(255,255,255,0.15)] hover:scale-105 hover:-translate-y-2',
      className
    )}>
      
      {/* Pillar Icon with enhanced hover effects */}
      <div className="mb-4 flex justify-center relative z-10">
        <div className="relative group-hover:animate-pulse">
          <div className={cn(
            "h-28 w-28 overflow-hidden rounded-full p-1 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.9)] dark:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.3),inset_-6px_-6px_12px_rgba(255,255,255,0.1)] transition-all duration-500 group-hover:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.15),inset_-8px_-8px_16px_rgba(255,255,255,1)] dark:group-hover:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.4),inset_-8px_-8px_16px_rgba(255,255,255,0.15)] group-hover:scale-110 flex items-center justify-center",
            colors.bgSolid
          )}>
            <PillarIcon className="h-12 w-12 text-white transition-transform duration-500 group-hover:scale-105" />
          </div>
          {/* Glowing ring on hover */}
          <div className={cn("absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse", colors.border)}></div>
        </div>
      </div>

      {/* Session Info with slide-up animation */}
      <div className="text-center relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
        <h3 className={cn("text-lg font-semibold transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400", colors.text)}>
          {getPillarName(session.pillar)}
        </h3>
        
        {/* Session Details - Horizontal layout with larger text */}
        <div className="mt-4 flex flex-wrap justify-center items-center gap-4 text-lg text-gray-800 dark:text-gray-200 transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">{formatDate(session.date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span className="font-medium">{session.time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="font-medium">{session.prestadorName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MeetingIcon className="h-5 w-5" />
            <span className="font-medium">{meetingLabel}</span>
          </div>
        </div>
      </div>

      {/* Action Button - Avaliar Sessão */}
      {session.status === 'completed' && (
        <div className="mt-6 flex justify-center relative z-10">
          <button 
            onClick={() => onRate?.(session.id)}
            className="rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-8 text-sm font-medium shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Avaliar Sessão
          </button>
        </div>
      )}

      {/* Animated border on hover */}
      <div className={cn("absolute inset-0 rounded-3xl border opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", colors.border)}></div>
    </div>
  )
}

export default SessionCard
