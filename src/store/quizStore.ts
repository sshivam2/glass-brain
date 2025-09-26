import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question, QuizSession, UserStats, QuizFilters } from '@/types/question';

interface NavigationState {
  selectedPlatform: string | null;
  selectedSubjects: number[];
  selectedTopics: string[];
}

interface QuizState {
  // Current session
  currentSession: QuizSession | null;
  
  // User statistics and progress
  userStats: UserStats;
  
  // Incorrect answers log for spaced repetition
  incorrectAnswers: Question[];
  
  // Quiz filters
  filters: QuizFilters;
  
  // Navigation state
  navigation: NavigationState;
  
  // Theme
  isDarkMode: boolean;
  
  // Actions
  startQuiz: (questions: Question[], mode: QuizSession['mode'], timeLimit?: number) => void;
  answerQuestion: (questionId: number, choiceId: number | null) => void;
  toggleMarkForReview: (questionId: number) => void;
  toggleRuleOutOption: (questionId: number, choiceId: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  updateUserStats: (correct: boolean, timeSpent: number, subjectId: number) => void;
  addIncorrectAnswer: (question: Question) => void;
  removeIncorrectAnswer: (questionId: number) => void;
  updateFilters: (filters: Partial<QuizFilters>) => void;
  updateNavigation: (navigation: Partial<NavigationState>) => void;
  resetNavigation: () => void;
  toggleTheme: () => void;
}

const initialUserStats: UserStats = {
  totalQuestionsAttempted: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  averageTime: 0,
  streakCount: 0,
  weakTopics: {},
  strengthTopics: {},
  dailyProgress: {},
};

const initialFilters: QuizFilters = {
  subjects: [],
  difficulty: [],
  tags: [],
  questionCount: 20,
  isRandom: true,
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      userStats: initialUserStats,
      incorrectAnswers: [],
      filters: initialFilters,
      navigation: {
        selectedPlatform: null,
        selectedSubjects: [],
        selectedTopics: [],
      },
      isDarkMode: false,

      startQuiz: (questions, mode, timeLimit) => {
        const sessionId = `quiz-${Date.now()}`;
        const newSession: QuizSession = {
          id: sessionId,
          mode,
          questions,
          currentIndex: 0,
          answers: {},
          markedForReview: new Set(),
          ruledOutOptions: {},
          startTime: new Date(),
          timeLimit,
          isCompleted: false,
        };
        set({ currentSession: newSession });
      },

      answerQuestion: (questionId, choiceId) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedAnswers = { ...currentSession.answers };
        updatedAnswers[questionId] = choiceId;

        set({
          currentSession: {
            ...currentSession,
            answers: updatedAnswers,
          },
        });
      },

      toggleMarkForReview: (questionId) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const newMarked = new Set(currentSession.markedForReview);
        if (newMarked.has(questionId)) {
          newMarked.delete(questionId);
        } else {
          newMarked.add(questionId);
        }

        set({
          currentSession: {
            ...currentSession,
            markedForReview: newMarked,
          },
        });
      },

      toggleRuleOutOption: (questionId, choiceId) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedRuledOut = { ...currentSession.ruledOutOptions };
        if (!updatedRuledOut[questionId]) {
          updatedRuledOut[questionId] = new Set();
        }

        const questionRuledOut = new Set(updatedRuledOut[questionId]);
        if (questionRuledOut.has(choiceId)) {
          questionRuledOut.delete(choiceId);
        } else {
          questionRuledOut.add(choiceId);
        }
        updatedRuledOut[questionId] = questionRuledOut;

        set({
          currentSession: {
            ...currentSession,
            ruledOutOptions: updatedRuledOut,
          },
        });
      },

      nextQuestion: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        if (currentSession.currentIndex < currentSession.questions.length - 1) {
          set({
            currentSession: {
              ...currentSession,
              currentIndex: currentSession.currentIndex + 1,
            },
          });
        }
      },

      previousQuestion: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        if (currentSession.currentIndex > 0) {
          set({
            currentSession: {
              ...currentSession,
              currentIndex: currentSession.currentIndex - 1,
            },
          });
        }
      },

      goToQuestion: (index) => {
        const { currentSession } = get();
        if (!currentSession) return;

        if (index >= 0 && index < currentSession.questions.length) {
          set({
            currentSession: {
              ...currentSession,
              currentIndex: index,
            },
          });
        }
      },

      completeQuiz: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        // Calculate score
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;

        currentSession.questions.forEach((question) => {
          const answer = currentSession.answers[question.id];
          if (answer === null || answer === undefined) {
            unanswered++;
          } else if (answer === question.correct_choice_id) {
            correct++;
          } else {
            incorrect++;
          }
        });

        const score = {
          correct,
          incorrect,
          unanswered,
          percentage: Math.round((correct / currentSession.questions.length) * 100),
        };

        set({
          currentSession: {
            ...currentSession,
            isCompleted: true,
            score,
          },
        });

        // Update user stats
        const { userStats } = get();
        const newStats = {
          ...userStats,
          totalQuestionsAttempted: userStats.totalQuestionsAttempted + currentSession.questions.length,
          correctAnswers: userStats.correctAnswers + correct,
          incorrectAnswers: userStats.incorrectAnswers + incorrect,
        };

        set({ userStats: newStats });
      },

      resetQuiz: () => {
        set({ currentSession: null });
      },

      updateUserStats: (correct, timeSpent, subjectId) => {
        const { userStats } = get();
        const today = new Date().toISOString().split('T')[0];

        const newStats = {
          ...userStats,
          dailyProgress: {
            ...userStats.dailyProgress,
            [today]: (userStats.dailyProgress[today] || 0) + 1,
          },
        };

        if (correct) {
          newStats.strengthTopics = {
            ...userStats.strengthTopics,
            [subjectId]: (userStats.strengthTopics[subjectId] || 0) + 1,
          };
        } else {
          newStats.weakTopics = {
            ...userStats.weakTopics,
            [subjectId]: (userStats.weakTopics[subjectId] || 0) + 1,
          };
        }

        set({ userStats: newStats });
      },

      addIncorrectAnswer: (question) => {
        const { incorrectAnswers } = get();
        if (!incorrectAnswers.find(q => q.id === question.id)) {
          set({ incorrectAnswers: [...incorrectAnswers, question] });
        }
      },

      removeIncorrectAnswer: (questionId) => {
        const { incorrectAnswers } = get();
        set({ incorrectAnswers: incorrectAnswers.filter(q => q.id !== questionId) });
      },

      updateFilters: (newFilters) => {
        const { filters } = get();
        set({ filters: { ...filters, ...newFilters } });
      },

      updateNavigation: (newNavigation) => {
        const { navigation } = get();
        set({ navigation: { ...navigation, ...newNavigation } });
      },

      resetNavigation: () => {
        set({
          navigation: {
            selectedPlatform: null,
            selectedSubjects: [],
            selectedTopics: [],
          },
        });
      },

      toggleTheme: () => {
        const { isDarkMode } = get();
        set({ isDarkMode: !isDarkMode });
        
        // Apply theme to document
        if (!isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        userStats: state.userStats,
        incorrectAnswers: state.incorrectAnswers,
        filters: state.filters,
        navigation: state.navigation,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);