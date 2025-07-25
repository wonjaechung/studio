export interface Question {
  id: string;
  subject: string;
  year: number;
  questionNumber: number;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E?: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  explanation?: {
    en?: {
      steps?: string[];
      distractors?: Record<string, string>;
      summary?: string;
    };
    ko?: {
      steps?: string[];
      distractors?: Record<string, string>;
      summary?: string;
    };
  };
  chartData?: any;
  chartType?: string;
}

export interface Subject {
  id: string;
  name: string;
  fullName: string;
  description: string;
  icon?: string;
  color: string;
  bgColor: string;
}

export interface Resource {
  id: string;
  subject: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'interactive' | 'webtoon';
  url?: string;
  content?: any;
  thumbnail?: string;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}