export interface ParsedFormData {
  deceased_name: string;
  gender: string;
  birth_date: string;
  death_date: string;
  zodiac: string;
  city: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  religion: string;
  family_zodiacs: string[];
  budget: number;
  completion_weeks: number;
  recommended_plan: string;
  special_requirements: string;
}

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
} 