import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { UserPlus, MessageCircle, Star, CheckCircle2, Calendar, Building2, Brain, Dumbbell, DollarSign, Scale, Eye } from 'lucide-react';

interface InfoCardProps {
  name: string;
  title?: string;
  subtitle?: string;
  avatar?: string;
  followers?: string;
  badge?: string;
  status?: 'online' | 'offline' | 'busy';
  rating?: number;
  isPremium?: boolean;
  onView?: () => void;
  onContact?: () => void;
  className?: string;
  variant?: 'default' | 'premium' | 'specialist';
  // Employee specific props
  company?: string;
  pillars?: string[];
  progress?: number;
  completedSessions?: number;
  totalSessions?: number;
  // Provider specific props
  specialty?: string;
  experience?: string;
  location?: string;
  nextAvailable?: string;
  type?: 'employee' | 'provider';
}

export function InfoCard({
  name,
  title,
  subtitle,
  avatar,
  followers,
  badge,
  status = 'offline',
  rating,
  isPremium = false,
  onView,
  onContact,
  className,
  variant = 'default',
  // Employee specific props
  company,
  pillars = [],
  progress,
  completedSessions,
  totalSessions,
  // Provider specific props
  specialty,
  experience,
  location,
  nextAvailable,
  type = 'employee'
}: InfoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'premium':
        return 'bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 border-slate-300 shadow-md';
      case 'specialist':
        return 'bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 border-slate-300 shadow-md';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-100 border-slate-300 shadow-md';
    }
  };

  const getPillarIcon = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental': return Brain;
      case 'Bem-Estar Físico': return Dumbbell;
      case 'Assistência Financeira': return DollarSign;
      case 'Assistência Jurídica': return Scale;
      default: return Brain;
    }
  };

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'Saúde Mental': return 'text-blue-600 bg-blue-100';
      case 'Bem-Estar Físico': return 'text-green-600 bg-green-100';
      case 'Assistência Financeira': return 'text-yellow-600 bg-yellow-100';
      case 'Assistência Jurídica': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group',
      getVariantStyles(variant),
      className
    )}>
      <CardContent className="p-4">
        {/* Status Indicators - Minimal */}
        <div className="absolute top-3 right-3">
          {rating && (
            <div className="flex items-center gap-1 bg-white rounded-full px-3 py-1.5 shadow-lg border-2 border-slate-200">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <span className="text-sm font-bold text-slate-800">{rating}</span>
            </div>
          )}
        </div>

        {/* Avatar - Minimal */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 text-white font-semibold text-lg">
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full p-1 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-white" />
      </div>
            )}
          </div>
        </div>

        {/* Name and Title - Minimal */}
        <div className="text-center mb-3">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors truncate">
            {name}
          </h3>
          {title && (
            <p className="text-sm text-slate-600 mt-1 truncate font-medium">{title}</p>
          )}
        </div>

        {/* Employee specific content - Minimal */}
        {type === 'employee' && (
          <>
            {/* Company - Minimal */}
            {company && (
              <div className="text-center mb-3">
                <p className="text-xs text-gray-500 truncate">{company}</p>
      </div>
            )}

            {/* Sessions Count - Main info */}
            {completedSessions !== undefined && totalSessions !== undefined && (
              <div className="text-center mb-3">
                <p className="text-lg font-semibold text-blue-600">
                  {completedSessions}/{totalSessions}
                </p>
                <p className="text-xs text-gray-500">sessões</p>
              </div>
            )}

            {/* Pillars - Minimal badges */}
            {pillars.length > 0 && (
              <div className="flex justify-center gap-1 mb-3">
                {pillars.slice(0, 2).map((pillar) => {
                  const Icon = getPillarIcon(pillar);
                  return (
                    <div key={pillar} className={cn("p-1 rounded-full", getPillarColor(pillar))}>
                      <Icon className="w-3 h-3" />
                    </div>
                  );
                })}
                {pillars.length > 2 && (
                  <div className="p-1 rounded-full bg-gray-100">
                    <span className="text-xs text-gray-500">+{pillars.length - 2}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Provider specific content - Minimal */}
        {type === 'provider' && (
          <>
            {/* Specialty - Main info */}
            {specialty && (
              <div className="text-center mb-3">
                <p className="text-sm font-medium text-slate-600 truncate">{specialty}</p>
              </div>
            )}

            {/* Experience - Minimal */}
            {experience && (
              <div className="text-center mb-3">
                <p className="text-xs text-gray-500">{experience}</p>
              </div>
            )}

            {/* Next Available - Key info */}
            {nextAvailable && (
              <div className="text-center mb-3">
                <p className="text-sm text-green-600 font-medium">
                  {nextAvailable}
                </p>
                <p className="text-xs text-gray-500">próxima disponibilidade</p>
              </div>
            )}
          </>
        )}

        {/* Generic content for other types */}
        {type !== 'employee' && type !== 'provider' && (
          <>
            {/* Followers */}
            {followers && (
              <div className="text-center mb-3">
                <p className="text-sm text-blue-600 font-medium">{followers}</p>
      </div>
            )}

            {/* Badge */}
            {badge && (
              <div className="flex justify-center mb-4">
                <Badge 
                  variant={isPremium ? "default" : "secondary"}
              className={cn(
                    "text-xs px-3 py-1",
                    isPremium ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" : ""
                  )}
                >
                  {badge}
                </Badge>
              </div>
            )}
          </>
        )}

        {/* Action Buttons - Minimal */}
        <div className="flex gap-2 mt-4">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="flex-1 bg-white hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-emerald-600 font-medium shadow-sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Button>
          )}
          {onContact && (
            <Button
              variant="default"
              size="sm"
              onClick={onContact}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium shadow-md"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Contactar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}