export interface Choice {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  choices: Choice[];
  text: string;
  unique_key: string;
  question_audio?: string | null;
  question_video?: string | null;
  map_id: number;
  difficulty_level: "beginner" | "intermediate" | "difficult";
  subjects_id: number[];
  solution: string;
  correct_choice_id: number;
  solution_audio?: string | null;
  solution_video?: string | null;
  audio_explanation_heading?: string | null;
  video_explanation_heading?: string | null;
  solution_media_position?: string;
  tags: string[];
}

export interface QuizSession {
  id: string;
  mode: "study" | "test" | "timed-study" | "timed-exam";
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number | null>;
  markedForReview: Set<number>;
  ruledOutOptions: Record<number, Set<number>>;
  startTime: Date;
  timeLimit?: number; // in minutes
  isCompleted: boolean;
  score?: {
    correct: number;
    incorrect: number;
    unanswered: number;
    percentage: number;
  };
}

export interface UserStats {
  totalQuestionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTime: number;
  streakCount: number;
  weakTopics: Record<number, number>; // subject_id -> incorrect_count
  strengthTopics: Record<number, number>; // subject_id -> correct_count
  dailyProgress: Record<string, number>; // date -> questions_answered
}

export interface QuizFilters {
  subjects: number[];
  difficulty: ("beginner" | "intermediate" | "difficult")[];
  tags: string[];
  questionCount: number;
  isRandom: boolean;
}