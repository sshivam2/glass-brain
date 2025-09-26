import { useState, useEffect } from "react";
import { Filter, Shuffle, Play, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useQuizStore } from "@/store/quizStore";
import { Question, QuizSession } from "@/types/question";
import questionsData from "@/data/questions.json";

interface QuizBuilderProps {
  mode: QuizSession['mode'];
  onBack: () => void;
  onStartQuiz: (questions: Question[]) => void;
}

const QuizBuilder = ({ mode, onBack, onStartQuiz }: QuizBuilderProps) => {
  const { filters, updateFilters } = useQuizStore();
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Record<number, string>>({});
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    // Load questions data
    const questions = questionsData as Question[];
    setAvailableQuestions(questions);

    // Extract unique subjects and tags
    const subjectMap: Record<number, string> = {};
    const tagSet = new Set<string>();

    questions.forEach(q => {
      q.subjects_id.forEach(subjectId => {
        subjectMap[subjectId] = `Subject ${subjectId}`;
      });
      q.tags.forEach(tag => tagSet.add(tag));
    });

    setSubjects(subjectMap);
    setTags(Array.from(tagSet));
  }, []);

  const filteredQuestions = availableQuestions.filter(question => {
    const { navigation } = useQuizStore.getState();
    
    // Filter by selected subjects from navigation
    if (navigation.selectedSubjects.length > 0) {
      const hasSubject = question.subjects_id.some(id => navigation.selectedSubjects.includes(id));
      if (!hasSubject) return false;
    }

    // Filter by selected topics from navigation
    if (navigation.selectedTopics.length > 0) {
      const hasTag = question.tags.some(tag => navigation.selectedTopics.includes(tag));
      if (!hasTag) return false;
    }

    // Additional filters
    if (filters.subjects.length > 0) {
      const hasSubject = question.subjects_id.some(id => filters.subjects.includes(id));
      if (!hasSubject) return false;
    }

    if (filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(question.difficulty_level)) return false;
    }

    if (filters.tags.length > 0) {
      const hasTag = question.tags.some(tag => filters.tags.includes(tag));
      if (!hasTag) return false;
    }

    return true;
  });

  const handleStartQuiz = () => {
    let selectedQuestions = [...filteredQuestions];
    
    // Shuffle if random is enabled
    if (filters.isRandom) {
      selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
    }

    // Limit to requested count
    selectedQuestions = selectedQuestions.slice(0, filters.questionCount);

    onStartQuiz(selectedQuestions);
  };

  const getModeIcon = () => {
    switch (mode) {
      case "study": return "📚";
      case "test": return "🎯";
      case "timed-study": return "⏰";
      case "timed-exam": return "⚡";
      default: return "📖";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "study": return "from-blue-500 to-blue-600";
      case "test": return "from-green-500 to-green-600";
      case "timed-study": return "from-orange-500 to-orange-600";
      case "timed-exam": return "from-red-500 to-red-600";
      default: return "from-primary to-accent";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="glass-button">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {getModeIcon()} Customize Your Quiz
            </h2>
            <p className="text-muted-foreground">
              Configure your {mode.replace('-', ' ')} session
            </p>
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleStartQuiz}
            disabled={filteredQuestions.length === 0}
            className={`bg-gradient-to-r ${getModeColor()} text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Quiz ({Math.min(filteredQuestions.length, filters.questionCount)} questions)
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Count */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Question Count</Label>
                  <span className="text-2xl font-bold text-primary">{filters.questionCount}</span>
                </div>
                <Slider
                  value={[filters.questionCount]}
                  onValueChange={([value]) => updateFilters({ questionCount: value })}
                  max={Math.min(100, filteredQuestions.length)}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 question</span>
                  <span>{Math.min(100, filteredQuestions.length)} questions</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Subjects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass p-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Subjects</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(subjects).map(([id, name]) => (
                    <motion.div
                      key={id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center space-x-2 glass-button p-3 rounded-lg"
                    >
                      <Checkbox
                        id={`subject-${id}`}
                        checked={filters.subjects.includes(Number(id))}
                        onCheckedChange={(checked) => {
                          const subjectId = Number(id);
                          if (checked) {
                            updateFilters({ subjects: [...filters.subjects, subjectId] });
                          } else {
                            updateFilters({ subjects: filters.subjects.filter(s => s !== subjectId) });
                          }
                        }}
                      />
                      <Label htmlFor={`subject-${id}`} className="text-sm font-medium">
                        {name}
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Difficulty */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass p-6">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Difficulty Level</Label>
                <div className="flex flex-wrap gap-3">
                  {["beginner", "intermediate", "difficult"].map((level) => (
                    <motion.div
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 glass-button p-3 rounded-lg"
                    >
                      <Checkbox
                        id={`difficulty-${level}`}
                        checked={filters.difficulty.includes(level as any)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilters({ difficulty: [...filters.difficulty, level as any] });
                          } else {
                            updateFilters({ difficulty: filters.difficulty.filter(d => d !== level) });
                          }
                        }}
                      />
                      <Label htmlFor={`difficulty-${level}`} className="text-sm font-medium capitalize">
                        {level}
                      </Label>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <Card className="glass p-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Quiz Summary</Label>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available Questions:</span>
                  <span className="font-semibold text-primary">{filteredQuestions.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Selected Count:</span>
                  <span className="font-semibold text-accent">{filters.questionCount}</span>
                </div>

                {(mode === "timed-study" || mode === "timed-exam") && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Time Limit:</span>
                    <span className="font-semibold text-warning">{filters.questionCount} min</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <Label htmlFor="random-toggle" className="text-sm font-medium">
                  Shuffle Questions
                </Label>
                <Switch
                  id="random-toggle"
                  checked={filters.isRandom}
                  onCheckedChange={(checked) => updateFilters({ isRandom: checked })}
                />
              </div>
            </div>
          </Card>

          <Card className="glass p-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Shuffle className="h-4 w-4 text-primary" />
                <Label className="font-semibold">Quick Actions</Label>
              </div>
              
              <Button
                variant="outline"
                onClick={() => updateFilters({ subjects: [], difficulty: [], tags: [] })}
                className="w-full glass-button"
              >
                Clear All Filters 
              </Button>
              
              <Button
                variant="outline"
                onClick={() => updateFilters({ 
                  subjects: Object.keys(subjects).map(Number),
                  difficulty: ["beginner", "intermediate", "difficult"],
                  tags: tags
                })}
                className="w-full glass-button"
              >
                Select All
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizBuilder;