import { useState } from 'react';
import { Home } from './components/Home';
import { CalendarPage } from './components/CalendarPage';
import { Sessions } from './components/Sessions';
import { Performance } from './components/Performance';
import { Recursos } from './components/Recursos';
import { BottomNav } from './components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'calendario' | 'sessoes' | 'recursos' | 'desempenho'>('dashboard');

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f5f7fa] overflow-hidden max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Home onNavigate={setCurrentPage} />
            </motion.div>
          )}
          {currentPage === 'calendario' && (
            <motion.div
              key="calendario"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <CalendarPage />
            </motion.div>
          )}
          {currentPage === 'sessoes' && (
            <motion.div
              key="sessoes"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Sessions />
            </motion.div>
          )}
          {currentPage === 'recursos' && (
            <motion.div
              key="recursos"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Recursos />
            </motion.div>
          )}
          {currentPage === 'desempenho' && (
            <motion.div
              key="desempenho"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Performance />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}