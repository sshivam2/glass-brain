import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Clock, 
  X, 
  CheckCircle,
  AlertCircle,
  Lightbulb 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore } from "@/store/quizStore";
import { Question } from "@/types/question";

interface QuizInterfaceProps {
  onComplete: () => void;
  onExit: () => void;
}

const QuizInterface = ({ onComplete, onExit }: QuizInterfaceProps) => {
  const { 
    currentSession,
    answerQuestion,
    toggleMarkForReview,
    toggleRuleOutOption,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    completeQuiz
  } = useQuizStore();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const currentQuestion = currentSession?.questions[currentSession.currentIndex];
  const isLastQuestion = currentSession?.currentIndex === (currentSession?.questions.length ?? 0) - 1;
  const currentAnswer = currentSession?.answers[currentQuestion?.id ?? 0];
  const isMarkedForReview = currentSession?.markedForReview.has(currentQuestion?.id ?? 0);
  const ruledOutOptions = currentSession?.ruledOutOptions[currentQuestion?.id ?? 0] || new Set();

  // Timer logic
  useEffect(() => {
    if (!currentSession?.timeLimit) return;

    const startTime = currentSession.startTime.getTime();
    const timeLimit = currentSession.timeLimit * 60 * 1000; // Convert to milliseconds

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, timeLimit - elapsed);
      
      setTimeLeft(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        completeQuiz();
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession, completeQuiz, onComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!currentQuestion) return;

      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
          const choiceIndex = parseInt(e.key) - 1;
          if (currentQuestion.choices[choiceIndex]) {
            answerQuestion(currentQuestion.id, currentQuestion.choices[choiceIndex].id);
          }
          break;
        case ' ':
          e.preventDefault();
          if (isLastQuestion) {
            completeQuiz();
            onComplete();
          } else {
            nextQuestion();
          }
          break;
        case 'm':
        case 'M':
          toggleMarkForReview(currentQuestion.id);
          break;
        case 'ArrowLeft':
          if (currentSession!.currentIndex > 0) {
            previousQuestion();
          }
          break;
        case 'ArrowRight':
          if (!isLastQuestion) {
            nextQuestion();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, answerQuestion, toggleMarkForReview, nextQuestion, previousQuestion, isLastQuestion]);

  const handleAnswerSelect = (choiceId: number) => {
    if (!currentQuestion) return;
    
    answerQuestion(currentQuestion.id, choiceId);
    
    // In study mode, show solution after answering
    if (currentSession?.mode === "study" || currentSession?.mode === "timed-study") {
      setShowSolution(true);
    }
  };

  const handleNext = () => {
    setShowSolution(false);
    if (isLastQuestion) {
      completeQuiz();
      onComplete();
    } else {
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    setShowSolution(false);
    previousQuestion();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stripHtmlTags = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  if (!currentSession || !currentQuestion) {
    return null;
  }

  const progress = ((currentSession.currentIndex + 1) / currentSession.questions.length) * 100;
  const isCorrect = currentAnswer === currentQuestion.correct_choice_id;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="glass sticky top-0 z-50 border-b border-border/50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onExit} className="glass-button">
                <X className="h-4 w-4 mr-2" />
                Exit
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Question {currentSession.currentIndex + 1} of {currentSession.questions.length}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {timeLeft !== null && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full glass ${
                  timeLeft < 60 ? 'text-red-500' : timeLeft < 300 ? 'text-orange-500' : 'text-primary'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-semibold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              
              <Button
                variant="ghost"
                onClick={() => toggleMarkForReview(currentQuestion.id)}
                className={`glass-button ${isMarkedForReview ? 'text-yellow-500' : ''}`}
              >
                <Flag className={`h-4 w-4 ${isMarkedForReview ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Question */}
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass p-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-lg leading-relaxed" 
                         dangerouslySetInnerHTML={{ __html: currentQuestion.text }} 
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentQuestion.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      currentQuestion.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {currentQuestion.difficulty_level}
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.choices.map((choice, index) => {
                    const isSelected = currentAnswer === choice.id;
                    const isRuledOut = ruledOutOptions.has(choice.id);
                    const isCorrectChoice = choice.id === currentQuestion.correct_choice_id;
                    const showFeedback = showSolution && (currentSession.mode === "study" || currentSession.mode === "timed-study");

                    return (
                      <motion.div
                        key={choice.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? showFeedback 
                              ? isCorrect 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-primary bg-primary/10'
                            : showFeedback && isCorrectChoice
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : isRuledOut
                                ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 opacity-50'
                                : 'border-border hover:border-primary/50 glass'
                        }`}
                        onClick={() => !showFeedback && handleAnswerSelect(choice.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                              isSelected 
                                ? 'border-primary bg-primary text-primary-foreground' 
                                : 'border-muted-foreground'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <div 
                              className={`flex-1 ${isRuledOut ? 'line-through opacity-60' : ''}`}
                              dangerouslySetInnerHTML={{ __html: choice.text }}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            {showFeedback && isCorrectChoice && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {showFeedback && isSelected && !isCorrect && (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRuleOutOption(currentQuestion.id, choice.id);
                              }}
                              className={`p-1 h-6 w-6 ${isRuledOut ? 'text-red-500' : 'text-muted-foreground'}`}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Solution */}
                <AnimatePresence>
                  {showSolution && (currentSession.mode === "study" || currentSession.mode === "timed-study") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 p-6 rounded-xl glass border-l-4 border-primary"
                    >
                      <div className="flex items-center space-x-2 mb-4">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">
                          {isCorrect ? "Correct! 🎉" : "Explanation"}
                        </h3>
                      </div>
                      <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: currentQuestion.solution }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSession.currentIndex === 0}
              className="glass-button"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Use keyboard: 1-4 for options, Space for next, M to mark
            </div>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              {isLastQuestion ? "Complete Quiz" : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;