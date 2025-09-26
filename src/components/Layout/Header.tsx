import { Moon, Sun, Settings, BarChart3, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuizStore } from "@/store/quizStore";
import { motion } from "framer-motion";

const Header = () => {
  const { isDarkMode, toggleTheme } = useQuizStore();

  return (
    <motion.header 
      className="glass sticky top-0 z-50 w-full border-b border-border/50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent opacity-20 blur-lg"></div>
            <div className="relative rounded-xl bg-gradient-to-r from-primary to-accent p-2">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              QuizMaster Pro
            </h1>
            <p className="text-xs text-muted-foreground">AI-Powered Learning</p>
          </div>
        </motion.div>

        {/* Navigation and Controls */}
        <div className="flex items-center space-x-2">
          {/* Quick Stats */}
          <motion.div 
            className="hidden md:flex items-center space-x-4 glass-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Stats</span>
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button variant="ghost" size="icon" className="glass-button">
              <Settings className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Theme Toggle */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="glass-button relative overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{
                  rotate: isDarkMode ? 180 : 0,
                  scale: isDarkMode ? 0 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sun className="h-4 w-4" />
              </motion.div>
              <motion.div
                initial={false}
                animate={{
                  rotate: isDarkMode ? 0 : -180,
                  scale: isDarkMode ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Moon className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;