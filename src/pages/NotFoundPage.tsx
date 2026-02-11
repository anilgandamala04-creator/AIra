import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Home, BookOpen, Search, Compass, Ghost } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const floatingIconVariants = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function NotFoundPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--theme-gradient)] dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <motion.div variants={floatingIconVariants} animate="animate" className="absolute top-1/4 left-1/4">
          <Ghost size={120} />
        </motion.div>
        <motion.div variants={floatingIconVariants} animate="animate" style={{ transitionDelay: '1s' }} className="absolute bottom-1/4 right-1/4">
          <Compass size={160} />
        </motion.div>
        <motion.div variants={floatingIconVariants} animate="animate" style={{ transitionDelay: '2s' }} className="absolute top-1/2 right-1/3">
          <Search size={80} />
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="text-center max-w-lg z-10"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-purple-500 blur-2xl rounded-full opacity-20"
            />
            <div className="w-24 h-24 rounded-3xl bg-white/20 dark:bg-slate-700/50 backdrop-blur-xl border border-white/30 dark:border-slate-600/50 flex items-center justify-center shadow-2xl relative">
              <FileQuestion className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
          Lost in Space?
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-slate-300 mb-10 leading-relaxed">
          The page you're searching for seems to have drifted away.
          Don't worry, your progress is safe! Let's get you back on track.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>

          {isAuthenticated && (
            <Link
              to="/curriculum"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-gray-800 dark:text-slate-100 font-bold border border-gray-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Go to Curriculum
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Decorative footer text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 text-xs font-mono text-gray-500 dark:text-slate-500"
      >
        HTTP Error 404: OBJECT_NOT_FOUND
      </motion.div>
    </div>
  );
}
