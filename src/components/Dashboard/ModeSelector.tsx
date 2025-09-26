import { Clock, BookOpen, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { QuizSession } from "@/types/question";

interface ModeSelectorProps {
  onModeSelect: (mode: QuizSession['mode']) => void;
}

const modes = [
  {
    id: "study" as const,
    title: "Study Mode",
    description: "Learn with immediate feedback and unlimited time",
    icon: BookOpen,
    color: "from-blue-500 to-blue-600",
    glowColor: "shadow-blue-500/30",
    features: ["Immediate feedback", "Unlimited time", "Performance tracking"]
  },
  {
    id: "test" as const,
    title: "Test Mode", 
    description: "Answer questions and see results at the end",
    icon: Target,
    color: "from-green-500 to-green-600",
    glowColor: "shadow-green-500/30",
    features: ["Results at end", "Performance analysis", "Topic completion"]
  },
  {
    id: "timed-study" as const,
    title: "Timed Study",
    description: "Study mode with time pressure (1 min per question)",
    icon: Clock,
    color: "from-orange-500 to-orange-600", 
    glowColor: "shadow-orange-500/30",
    features: ["1 minute per question", "Immediate feedback", "Time awareness"]
  },
  {
    id: "timed-exam" as const,
    title: "Timed Exam",
    description: "Full exam simulation with strict timing",
    icon: Zap,
    color: "from-red-500 to-red-600",
    glowColor: "shadow-red-500/30",
    features: ["Exam simulation", "Strict timing", "Final results only"]
  }
];

const ModeSelector = ({ onModeSelect }: ModeSelectorProps) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Choose Your Learning Mode
        </h2>
        <p className="text-muted-foreground text-lg">
          Select the perfect mode for your learning style and goals
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`glass glass-hover cursor-pointer border-0 p-6 h-full transition-all duration-300 hover:shadow-2xl hover:${mode.glowColor} group`}
                onClick={() => onModeSelect(mode.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${mode.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {mode.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {mode.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {mode.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                        className="flex items-center space-x-2 text-sm text-muted-foreground"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-primary to-accent"></div>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className={`w-full bg-gradient-to-r ${mode.color} hover:shadow-lg hover:${mode.glowColor} border-0 text-white font-medium`}
                      size="lg"
                    >
                      Start {mode.title}
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ModeSelector;