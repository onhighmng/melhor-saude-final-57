import { BookingPillar } from '@/components/booking/BookingFlow';

/**
 * Maps BookingPillar types to topic data pillar IDs
 * 
 * BookingPillar is what users select: 'psicologica', 'financeira', 'juridica', 'fisica'
 * Topic pillar IDs are used in topicsData.ts: 'saude_mental', 'assistencia_financeira', etc.
 */
export const pillarToTopicId: Record<BookingPillar, string> = {
  'psicologica': 'saude_mental',
  'fisica': 'bem_estar_fisico',
  'financeira': 'assistencia_financeira',
  'juridica': 'assistencia_juridica',
};

/**
 * Maps topic pillar IDs back to BookingPillar types
 */
export const topicIdToPillar: Record<string, BookingPillar> = {
  'saude_mental': 'psicologica',
  'bem_estar_fisico': 'fisica',
  'assistencia_financeira': 'financeira',
  'assistencia_juridica': 'juridica',
};

/**
 * Convert BookingPillar to topic data pillar ID
 */
export const getTopicPillarId = (pillar: BookingPillar): string => {
  return pillarToTopicId[pillar];
};

/**
 * Convert topic data pillar ID to BookingPillar
 */
export const getBookingPillar = (topicPillarId: string): BookingPillar | null => {
  return topicIdToPillar[topicPillarId] || null;
};
