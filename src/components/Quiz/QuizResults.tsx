import { useState } from "react";
import { 
  Trophy, 
  Target, 
  Clock, 
  RefreshCw, 
  Home, 
  Share2,
  Download,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useQuizStore } from "@/store/quizStore";

interface QuizResultsProps {
  onReturnHome: () => void;
  onRetakeQuiz: () => void;
}

const QuizResults = ({ onReturnHome, onRetakeQuiz }: QuizResultsProps) => {
  const { currentSession, userStats } = useQuizStore();
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  if (!currentSession || !currentSession.score) {
    return null;
  }

  const { score } = currentSession;
  const timeTaken = new Date().getTime() - currentSession.startTime.getTime();
  const averageTimePerQuestion = Math.round(timeTaken / (1000 * currentSession.questions.length));

  const getPerformanceMessage = () => {
    if (score.percentage >= 90) return { message: "Outstanding! 🌟", color: "text-yellow-500" };
    if (score.percentage >= 80) return { message: "Excellent! 🎉", color: "text-green-500" };
    if (score.percentage >= 70) return { message: "Good job! 👍", color: "text-blue-500" };
    if (score.percentage >= 60) return { message: "Not bad! 📚", color: "text-orange-500" };
    return { message: "Keep practicing! 💪", color: "text-red-500" };
  };

  const performance = getPerformanceMessage();

  const stats = [
    {
      label: "Score",
      value: `${score.correct}/${currentSession.questions.length}`,
      percentage: score.percentage,
      icon: Target,
      color: "text-primary"
    },
    {
      label: "Accuracy",
      value: `${score.percentage}%`,
      percentage: score.percentage,
      icon: Award,
      color: "text-success"
    },
    {
      label: "Time Taken",
      value: `${Math.floor(timeTaken / 60000)}:${Math.floor((timeTaken % 60000) / 1000).toString().padStart(2, '0')}`,
      percentage: 100,
      icon: Clock,
      color: "text-accent"
    },
    {
      label: "Avg per Question",
      value: `${averageTimePerQuestion}s`,
      percentage: Math.min(100, (60 / averageTimePerQuestion) * 100),
      icon: TrendingUp,
      color: "text-warning"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-4"
            >
              <Trophy className="h-20 w-20 mx-auto text-yellow-500" />
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-2">Quiz Complete!</h1>
            <p className={`text-xl ${performance.color} font-semibold`}>
              {performance.message}
            </p>
          </motion.div>

          {/* Score Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="glass p-8 text-center">
              <div className="space-y-6">
                <div>
                  <div className="text-6xl font-bold text-primary mb-2">
                    {score.percentage}%
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {score.correct} correct out of {currentSession.questions.length} questions
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Progress value={score.percentage} className="h-4" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Detailed Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="glass p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                        <span className="font-semibold">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    {stat.label !== "Time Taken" && (
                      <Progress value={stat.percentage} className="h-2" />
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="glass p-6">
              <h3 className="text-xl font-semibold mb-4">Answer Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-500">{score.correct}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-500">{score.incorrect}</div>
                  <div className="text-sm text-muted-foreground">Incorrect</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="h-8 w-8 rounded-full border-4 border-gray-400"></div>
                  </div>
                  <div className="text-2xl font-bold text-gray-500">{score.unanswered}</div>
                  <div className="text-sm text-muted-foreground">Unanswered</div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              onClick={onReturnHome}
              variant="outline"
              size="lg"
              className="glass-button"
            >
              <Home className="h-4 w-4 mr-2" />
              Return Home
            </Button>
            
            <Button
              onClick={onRetakeQuiz}
              size="lg"
              className="glass-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            
            <Button
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              variant="outline"
              size="lg"
              className="glass-button"
            >
              <Target className="h-4 w-4 mr-2" />
              {showDetailedResults ? "Hide" : "Show"} Details
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="glass-button"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="glass-button"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </motion.div>

          {/* Detailed Question Review */}
          {showDetailedResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              <Card className="glass p-6">
                <h3 className="text-xl font-semibold mb-4">Question Review</h3>
                <div className="space-y-4">
                  {currentSession.questions.map((question, index) => {
                    const userAnswer = currentSession.answers[question.id];
                    const isCorrect = userAnswer === question.correct_choice_id;
                    const correctChoice = question.choices.find(c => c.id === question.correct_choice_id);
                    const userChoice = question.choices.find(c => c.id === userAnswer);

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border ${
                          isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                          userAnswer ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                          'border-gray-300 bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium">Question {index + 1}</span>
                          <div className="flex items-center space-x-2">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : userAnswer ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          {userAnswer && (
                            <div>
                              <span className="font-medium">Your answer: </span>
                              <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {userChoice ? userChoice.text.replace(/<[^>]*>/g, '') : 'None'}
                              </span>
                            </div>
                          )}
                          
                          {!isCorrect && (
                            <div>
                              <span className="font-medium">Correct answer: </span>
                              <span className="text-green-600">
                                {correctChoice ? correctChoice.text.replace(/<[^>]*>/g, '') : 'None'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;