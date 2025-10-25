import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, CheckCircle2, Video, Phone } from 'lucide-react';
import { BookingPillar } from './BookingFlow';
import { FollowerPointerCard } from '@/components/ui/following-pointer';
import { getPillarColors } from '@/lib/utils';

interface Provider {
  id: string;
  name: string;
  specialty: string;
  avatar_url: string;
}

interface ConfirmationStepProps {
  pillar: BookingPillar;
  topic: string;
  provider: Provider;
  selectedDate: Date;
  selectedTime: string;
  meetingType?: 'virtual' | 'phone';
  onBack: () => void;
  onConfirm: () => void;
  isConfirming?: boolean;
}

export const ConfirmationStep = ({
  pillar,
  topic,
  provider,
  selectedDate,
  selectedTime,
  meetingType = 'virtual',
  onBack,
  onConfirm,
  isConfirming = false
}: ConfirmationStepProps) => {
  
  const getPillarType = (pillar: BookingPillar): string => {
    switch (pillar) {
      case 'psicologica': return 'mental-health';
      case 'fisica': return 'physical-wellness';
      case 'financeira': return 'financial-assistance';
      case 'juridica': return 'legal-assistance';
      default: return 'mental-health';
    }
  };
  
  const pillarColors = getPillarColors(getPillarType(pillar));
  
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f9fafb', 
      padding: '1rem',
      overflow: 'hidden',
      marginLeft: '4rem' // Account for sidebar width
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '32rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem' 
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '4rem', 
            height: '4rem', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '50%', 
            marginBottom: '0.75rem' 
          }}>
            <CheckCircle2 size={32} color="#3b82f6" />
          </div>
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem',
            margin: 0
          }}>Confirmar Agendamento</h1>
          <p style={{ 
            fontSize: '1rem', 
            color: '#6b7280',
            margin: 0
          }}>Reveja os detalhes da sua sessão</p>
        </div>

        <FollowerPointerCard
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
              <div style={{ 
                width: '1.25rem', 
                height: '1.25rem', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <CheckCircle2 size={12} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Sessão</span>
            </div>
          }
        >
          <Card style={{ 
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'box-shadow 0.3s',
            width: '100%'
          }}>
            <CardHeader style={{ borderBottom: '1px solid #e5e7eb', padding: '1.5rem' }}>
              <CardTitle style={{ fontSize: '1.5rem', margin: 0 }}>Detalhes da Sessão</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Provider Info */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                paddingBottom: '1rem', 
                borderBottom: '1px solid #e5e7eb' 
              }}>
                <User size={20} color="#6b7280" />
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    fontWeight: '600', 
                    fontSize: '1.125rem', 
                    margin: 0,
                    marginBottom: '0.5rem'
                  }}>Nosso Especialista</p>
                  <p style={{ 
                    fontSize: '1rem', 
                    color: '#6b7280',
                    margin: 0
                  }}>{provider.specialty}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem', 
                paddingBottom: '1rem', 
                borderBottom: '1px solid #e5e7eb' 
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <Calendar size={20} color="#6b7280" style={{ marginTop: '2px' }} />
                  <div>
                    <p style={{ 
                      fontWeight: '600', 
                      fontSize: '1.125rem', 
                      margin: 0,
                      marginBottom: '0.5rem'
                    }}>Data e Hora</p>
                    <p style={{ 
                      fontSize: '1rem', 
                      color: '#6b7280',
                      margin: 0
                    }}>{formatDate(selectedDate)} às {selectedTime}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {meetingType === 'virtual' ? (
                    <Video size={20} color="#6b7280" style={{ marginTop: '2px' }} />
                  ) : (
                    <Phone size={20} color="#6b7280" style={{ marginTop: '2px' }} />
                  )}
                  <div>
                    <p style={{ 
                      fontWeight: '600', 
                      fontSize: '1.125rem', 
                      margin: 0,
                      marginBottom: '0.5rem'
                    }}>Formato</p>
                    <p style={{ 
                      fontSize: '1rem', 
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {meetingType === 'virtual'
                        ? 'Videochamada Online'
                        : 'Chamada Telefónica'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Topic */}
              <div style={{ 
                backgroundColor: pillarColors.bg?.includes('blue') ? '#dbeafe' : '#f0f9ff',
                borderRadius: '0.5rem', 
                padding: '1rem' 
              }}>
                <p style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  margin: 0,
                  marginBottom: '0.5rem',
                  color: '#6b7280'
                }}>Área de Foco</p>
                <p style={{ 
                  fontSize: '1rem', 
                  color: '#6b7280',
                  margin: 0
                }}>{topic}</p>
              </div>
            </CardContent>
          </Card>
        </FollowerPointerCard>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <FollowerPointerCard
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'white' }}>
                <div style={{ 
                  width: '1rem', 
                  height: '1rem', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <CheckCircle2 size={10} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>OK</span>
              </div>
            }
          >
            <Button 
              onClick={onConfirm}
              disabled={isConfirming}
              style={{
                padding: '0.5rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                border: 'none',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                cursor: isConfirming ? 'not-allowed' : 'pointer',
                opacity: isConfirming ? 0.7 : 1,
                transition: 'all 0.3s'
              }}
            >
              {isConfirming ? 'A confirmar...' : 'Confirmar Agendamento'}
            </Button>
          </FollowerPointerCard>
        </div>
      </div>
    </div>
  );
};
