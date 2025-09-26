import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Question } from "@/types/question";
import questionsData from "@/data/questions.json";

interface SubjectSelectorProps {
  platform: string;
  onBack: () => void;
  onSubjectsSelect: (subjects: number[]) => void;
}

const SubjectSelector = ({ platform, onBack, onSubjectsSelect }: SubjectSelectorProps) => {
  const [availableSubjects, setAvailableSubjects] = useState<Record<number, string>>({});
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [subjectCounts, setSubjectCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const questions = questionsData as Question[];
    const subjectMap: Record<number, string> = {};
    const counts: Record<number, number> = {};

    questions.forEach(q => {
      q.subjects_id.forEach(subjectId => {
        subjectMap[subjectId] = `Subject ${subjectId}`;
        counts[subjectId] = (counts[subjectId] || 0) + 1;
      });
    });

    setAvailableSubjects(subjectMap);
    setSubjectCounts(counts);
  }, []);

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleContinue = () => {
    if (selectedSubjects.length > 0) {
      onSubjectsSelect(selectedSubjects);
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
              Select Subjects
            </h2>
            <p className="text-muted-foreground">
              Choose subjects from {platform}
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleContinue}
          disabled={selectedSubjects.length === 0}
          className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2"
        >
          Continue ({selectedSubjects.length} selected)
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(availableSubjects).map(([id, name], index) => {
          const subjectId = Number(id);
          const isSelected = selectedSubjects.includes(subjectId);
          const questionCount = subjectCounts[subjectId] || 0;
          
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card 
                className={`glass p-4 cursor-pointer transition-all duration-300 border-border/50 ${
                  isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/30'
                }`}
                onClick={() => handleSubjectToggle(subjectId)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => {}} // Handled by card click
                    className="pointer-events-none"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {questionCount} questions
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center space-x-4"
      >
        <Button
          variant="outline"
          onClick={() => setSelectedSubjects(Object.keys(availableSubjects).map(Number))}
          className="glass-button"
        >
          Select All
        </Button>
        <Button
          variant="outline"
          onClick={() => setSelectedSubjects([])}
          className="glass-button"
        >
          Clear All
        </Button>
      </motion.div>
    </div>
  );
};

export default SubjectSelector;