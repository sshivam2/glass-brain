import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Question } from "@/types/question";
import questionsData from "@/data/questions.json";

interface TopicSelectorProps {
  platform: string;
  subjects: number[];
  onBack: () => void;
  onTopicsSelect: (topics: string[]) => void;
}

const TopicSelector = ({ platform, subjects, onBack, onTopicsSelect }: TopicSelectorProps) => {
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicCounts, setTopicCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const questions = questionsData as Question[];
    const topicSet = new Set<string>();
    const counts: Record<string, number> = {};

    questions
      .filter(q => q.subjects_id.some(id => subjects.includes(id)))
      .forEach(q => {
        q.tags.forEach(tag => {
          topicSet.add(tag);
          counts[tag] = (counts[tag] || 0) + 1;
        });
      });

    setAvailableTopics(Array.from(topicSet));
    setTopicCounts(counts);
  }, [subjects]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleContinue = () => {
    onTopicsSelect(selectedTopics);
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
              Select Topics
            </h2>
            <p className="text-muted-foreground">
              Choose topics from selected subjects
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleContinue}
          className="bg-gradient-to-r from-primary to-accent text-white px-6 py-2"
        >
          Continue to Modes
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableTopics.map((topic, index) => {
          const isSelected = selectedTopics.includes(topic);
          const questionCount = topicCounts[topic] || 0;
          
          return (
            <motion.div
              key={topic}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card 
                className={`glass p-4 cursor-pointer transition-all duration-300 border-border/50 ${
                  isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/30'
                }`}
                onClick={() => handleTopicToggle(topic)}
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => {}} // Handled by card click
                    className="pointer-events-none"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground capitalize">
                      {topic}
                    </h3>
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
          onClick={() => setSelectedTopics(availableTopics)}
          className="glass-button"
        >
          Select All Topics
        </Button>
        <Button
          variant="outline"
          onClick={() => setSelectedTopics([])}
          className="glass-button"
        >
          Clear Selection
        </Button>
      </motion.div>

      {/* Skip Option */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Button
          variant="ghost"
          onClick={handleContinue}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip topic selection and include all topics
        </Button>
      </motion.div>
    </div>
  );
};

export default TopicSelector;