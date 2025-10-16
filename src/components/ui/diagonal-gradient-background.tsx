import { motion } from 'framer-motion';

export function DiagonalGradientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base diagonal gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 25%, #4a7ba7 50%, #8b6f5e 75%, #d4a574 100%)',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Animated blur layers */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 80% 20%, rgba(212, 165, 116, 0.6) 0%, transparent 60%)',
          filter: 'blur(120px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 70%, rgba(45, 90, 123, 0.7) 0%, transparent 60%)',
          filter: 'blur(100px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 60% 40%, rgba(74, 123, 167, 0.5) 0%, transparent 70%)',
          filter: 'blur(140px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Diagonal sweep effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(125deg, transparent 0%, rgba(139, 111, 94, 0.3) 50%, transparent 100%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: ['-100%', '100%'],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Subtle color shifts */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 20% 80%, rgba(30, 58, 95, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(212, 165, 116, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(30, 58, 95, 0.4) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Overlay for depth */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
        }}
      />
    </div>
  );
}
