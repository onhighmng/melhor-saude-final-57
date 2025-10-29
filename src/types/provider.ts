
export interface Provider {
  id: string;
  name: string;
  photo: string;
  specialization: string;
  pillar?: string;
  shortBio: string;
  fullBio: string;
  experience: string;
  education: string[];
  specialties: string[];
  activeCases: number;
  videoUrl?: string;
  videoDescription?: string;
}

