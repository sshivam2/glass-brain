import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore } from "@/store/quizStore";
import { Question, QuizSession } from "@/types/question";

// Components
import Header from "@/components/Layout/Header";
import ModeSelector from "@/components/Dashboard/ModeSelector";
import QuizBuilder from "@/components/Quiz/QuizBuilder";
import QuizInterface from "@/components/Quiz/QuizInterface";
import QuizResults from "@/components/Quiz/QuizResults";

const Index = () => {
  const { currentSession, isDarkMode, resetQuiz } = useQuizStore();
  const [currentView, setCurrentView] = useState<'home' | 'builder' | 'quiz' | 'results'>('home');
  const [selectedMode, setSelectedMode] = useState<QuizSession['mode'] | null>(null);

  // Apply dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleModeSelect = (mode: QuizSession['mode']) => {
    setSelectedMode(mode);
    setCurrentView('builder');
  };

  const handleStartQuiz = (questions: Question[]) => {
    const timeLimit = selectedMode === 'timed-study' || selectedMode === 'timed-exam' 
      ? questions.length 
      : undefined;
    
    useQuizStore.getState().startQuiz(questions, selectedMode!, timeLimit);
    setCurrentView('quiz');
  };

  const handleQuizComplete = () => {
    setCurrentView('results');
  };

  const handleReturnHome = () => {
    resetQuiz();
    setCurrentView('home');
    setSelectedMode(null);
  };

  const handleRetakeQuiz = () => {
    if (currentSession) {
      const { questions, mode } = currentSession;
      const timeLimit = mode === 'timed-study' || mode === 'timed-exam' 
        ? questions.length 
        : undefined;
      
      useQuizStore.getState().startQuiz(questions, mode, timeLimit);
      setCurrentView('quiz');
    }
  };

  const handleBackToModeSelect = () => {
    setCurrentView('home');
    setSelectedMode(null);
  };

  const handleExitQuiz = () => {
    resetQuiz();
    setCurrentView('home');
    setSelectedMode(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
            animate={{
              x: [0, -150, 0],
              y: [0, 100, 0],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="container mx-auto px-4 py-12"
              >
                <ModeSelector onModeSelect={handleModeSelect} />
              </motion.div>
            )}

            {currentView === 'builder' && selectedMode && (
              <motion.div
                key="builder"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="container mx-auto px-4 py-8"
              >
                <QuizBuilder
                  mode={selectedMode}
                  onBack={handleBackToModeSelect}
                  onStartQuiz={handleStartQuiz}
                />
              </motion.div>
            )}

            {currentView === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <QuizInterface
                  onComplete={handleQuizComplete}
                  onExit={handleExitQuiz}
                />
              </motion.div>
            )}

            {currentView === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5 }}
              >
                <QuizResults
                  onReturnHome={handleReturnHome}
                  onRetakeQuiz={handleRetakeQuiz}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Index;
