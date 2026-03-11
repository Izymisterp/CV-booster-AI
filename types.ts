
export interface FileData {
  data: string;
  mimeType: string;
  name: string;
}

export interface RefinementData {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  links: {
    linkedin?: string;
    portfolio?: string;
    github?: string;
  };
  additionalExperience: string;
}

export interface CVExperience {
  company: string;
  position: string;
  period: string;
  description: string[];
}

export interface CVCompactExperience {
  company: string;
  position: string;
  period: string;
}

export interface CVEducation {
  school: string;
  degree: string;
  year: string;
}

export interface StructuredCV {
  fullName: string;
  professionalTitle: string;
  summary: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
    github?: string;
  };
  experiences: CVExperience[];
  compactExperiences?: CVCompactExperience[]; // Nouvelles expériences condensées
  education: CVEducation[];
  skills: string[];
}

export interface AnalysisResult {
  id?: string;
  createdAt?: number;
  originalCVContent?: string;
  originalJobDescription?: string;
  atsScore?: number; // Score ATS (0-100)
  improvedCV: StructuredCV;
  coverLetter: string;
  motivations: string[]; // Nouvelle section
  keywordsFound: string[];
  suggestions: string[];
}

export enum AppStatus {
  IDLE = 'idle',
  REFINING = 'refining',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}
