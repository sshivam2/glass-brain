import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Target, Stethoscope } from "lucide-react";

interface PlatformSelectorProps {
  onPlatformSelect: (platform: string) => void;
}

const platforms = [
  {
    id: "marrow",
    name: "Marrow",
    description: "Comprehensive medical education platform",
    icon: Stethoscope,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "cerebellum", 
    name: "Cerebellum",
    description: "Advanced neuroscience & medical studies",
    icon: Brain,
    color: "from-purple-500 to-purple-600", 
    bgColor: "bg-purple-500/10",
  },
  {
    id: "prepladder",
    name: "PrepLadder",
    description: "Medical entrance exam preparation",
    icon: Target,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    id: "dams",
    name: "DAMS",
    description: "Delhi Academy of Medical Sciences",
    icon: BookOpen,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500/10",
  },
];

const PlatformSelector = ({ onPlatformSelect }: PlatformSelectorProps) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Choose Your Platform
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select the educational platform you want to study from
        </p>
      </motion.div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {platforms.map((platform, index) => {
          const IconComponent = platform.icon;
          
          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="glass p-6 cursor-pointer hover:bg-background/50 transition-all duration-300 border-border/50 hover:border-primary/30"
                onClick={() => onPlatformSelect(platform.id)}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${platform.bgColor}`}>
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className={`w-full bg-gradient-to-r ${platform.color} text-white border-none hover:opacity-90`}
                  >
                    Select Platform
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformSelector;