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
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200';
      case 'specialist':
        return 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200';
      default:
        return 'bg-white border-gray-200';
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
            <div className="flex items-center gap-1 bg-white/90 rounded-full px-2 py-1 shadow-sm">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs font-medium">{rating}</span>
            </div>
          )}
        </div>

        {/* Avatar - Minimal */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-0.5">
                <CheckCircle2 className="w-3 h-3 text-white" />
      </div>
            )}
          </div>
        </div>

        {/* Name and Title - Minimal */}
        <div className="text-center mb-3">
          <h3 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors truncate">
            {name}
          </h3>
          {title && (
            <p className="text-xs text-gray-500 mt-1 truncate">{title}</p>
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
                <p className="text-sm font-medium text-gray-700 truncate">{specialty}</p>
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
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 text-xs"
              onClick={onView}
            >
              <Eye className="w-3 h-3 mr-1" />
              Ver
            </Button>
          )}
          {onContact && (
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-800 text-xs"
              onClick={onContact}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Contactar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}