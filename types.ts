
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
  education: CVEducation[];
  skills: string[];
}

export interface AnalysisResult {
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
