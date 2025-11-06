import { motion } from "motion/react";
import { useEffect, useState } from "react";
import onHighLogo from "@/assets/25338cdf97b624bc7db37b410b2a5495dfc563c4.png";

interface LoadingAnimationProps {
  variant?: "fullscreen" | "inline" | "modal";
  message?: string;
  submessage?: string;
  showProgress?: boolean;
  mascotSrc?: string;
  wordmarkSrc?: string;
  primaryColor?: string;
  glowColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

// Floating particle component
function FloatingParticle({ delay, duration, size }: { delay: number; duration: number; size: number }) {
  const randomX = Math.random() * 100 - 50;
  const randomY = Math.random() * 100 - 50;
  
  return (
    <motion.div
      className="absolute rounded-full bg-white/30"
      style={{
        width: size,
        height: size,
        left: `${50 + randomX}%`,
        top: `${50 + randomY}%`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, Math.random() * 20 - 10, 0],
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

export function LoadingAnimation({
  variant = "fullscreen",
  message = "Carregando...",
  submessage = "Estamos preparando a sua experiência.",
  showProgress = true,
  mascotSrc,
  wordmarkSrc,
  primaryColor = "#1877F2",
  glowColor,
  textColor = "#1E3A8A",
  backgroundColor,
}: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showProgress) return;
    
    // Realistic progress: starts fast, then slows down
    // Goes up to 90% and waits for actual completion
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stop at 90% and wait
        // Exponential slowdown
        const increment = (90 - prev) * 0.1;
        return Math.min(prev + increment, 90);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [showProgress]);

  // Derive glow color from primary color if not provided
  const effectiveGlowColor = glowColor || primaryColor;

  const containerClasses = {
    fullscreen: "fixed inset-0 z-50 flex items-center justify-center",
    inline: "flex items-center justify-center py-8",
    modal: "fixed inset-0 z-50 flex items-center justify-center",
  };

  const loadingContent = (
    <div className="flex flex-col items-center gap-8 relative z-10">
      {/* Main Loading Container with Glass Morphism */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Circular Glow Rings */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: "280px", height: "280px", left: "-74px", top: "-74px" }}
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${180 + i * 30}px`,
                height: `${180 + i * 30}px`,
                border: `1px solid ${effectiveGlowColor}${Math.floor(30 / i).toString(16).padStart(2, '0')}`,
                boxShadow: `0 0 ${20 + i * 10}px ${effectiveGlowColor}${Math.floor(20 / i).toString(16).padStart(2, '0')}`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.7, 0.4],
                rotate: i % 2 === 0 ? [0, 360] : [360, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

          {/* Mascot Symbol with 3D Effect - INCREASED SIZE */}
          <motion.div
            className="relative z-20 w-48 h-48 flex items-center justify-center"
            animate={{
              y: [0, -8, 0],
              rotateY: [-5, 5, -5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              transformStyle: "preserve-3d",
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
            }}
          >
            {mascotSrc ? (
              <motion.img
                src={mascotSrc}
                alt="Logo"
                className="w-40 h-40 object-contain"
              animate={{
                filter: [
                  "brightness(1) contrast(1)",
                  "brightness(1.1) contrast(1.05)",
                  "brightness(1) contrast(1)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ) : (
            // Enhanced Fallback SVG mascot
            <svg
              width="112"
              height="112"
              viewBox="0 0 96 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="mascotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={primaryColor} />
                  <stop offset="100%" stopColor={`${primaryColor}cc`} />
                </linearGradient>
              </defs>
              <motion.circle
                cx="48"
                cy="30"
                r="14"
                fill="url(#mascotGradient)"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.path
                d="M48 48C36 48 26.4 54 26.4 62.4V78C26.4 80.6509 28.5491 82.8 31.2 82.8H64.8C67.4509 82.8 69.6 80.6509 69.6 78V62.4C69.6 54 60 48 48 48Z"
                fill="url(#mascotGradient)"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
              />
              <motion.ellipse
                cx="21.6"
                cy="60"
                rx="7.2"
                ry="19.2"
                fill={primaryColor}
                opacity="0.9"
                animate={{ x: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.ellipse
                cx="74.4"
                cy="60"
                rx="7.2"
                ry="19.2"
                fill={primaryColor}
                opacity="0.9"
                animate={{ x: [2, -2, 2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </svg>
          )}
        </motion.div>
      </motion.div>

      {/* Brand Wordmark with Shimmer - INCREASED SIZE */}
      {wordmarkSrc && (
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <motion.img
            src={wordmarkSrc}
            alt="Brand"
            className="h-16 object-contain relative z-10"
            style={{
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))",
            }}
          />
          {/* Shimmer effect on wordmark */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{
              x: ["-200%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1,
            }}
          />
        </motion.div>
      )}

      {/* Modern Progress Bar with Liquid Effect */}
      {showProgress && (
        <motion.div
          className="w-80 relative mt-8"
          initial={{ opacity: 0, scaleX: 0.8, y: 10 }}
          animate={{ opacity: 1, scaleX: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Progress container */}
          <div 
            className="h-2 rounded-full overflow-hidden bg-white/60 relative"
            style={{
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {/* Progress Fill with Gradient */}
            <motion.div
              className="h-full relative rounded-full"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd, ${primaryColor})`,
                boxShadow: `0 0 20px ${effectiveGlowColor}60, inset 0 1px 0 rgba(255,255,255,0.3)`,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Liquid wave effect */}
              <motion.div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `repeating-linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 10px, transparent 20px)`,
                }}
                animate={{
                  x: ["0px", "-20px"],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Glowing Orb at Progress Point */}
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, white, ${primaryColor})`,
                  boxShadow: `0 0 12px ${effectiveGlowColor}, 0 0 24px ${effectiveGlowColor}80`,
                }}
                animate={{
                  scale: [1, 1.4, 1],
                  boxShadow: [
                    `0 0 12px ${effectiveGlowColor}, 0 0 24px ${effectiveGlowColor}80`,
                    `0 0 20px ${effectiveGlowColor}, 0 0 40px ${effectiveGlowColor}`,
                    `0 0 12px ${effectiveGlowColor}, 0 0 24px ${effectiveGlowColor}80`,
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              style={{ width: "30%" }}
              animate={{
                x: ["-100%", "400%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 0.5,
              }}
            />
          </div>

          {/* Percentage Display */}
          <motion.div
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-white shadow-md"
            style={{
              color: textColor,
            }}
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {Math.round(progress)}%
          </motion.div>
        </motion.div>
      )}
    </div>
  );

  // Fullscreen variant with background
  if (variant === "fullscreen") {
    return (
      <div 
        className={containerClasses.fullscreen}
        style={{
          background: backgroundColor || `radial-gradient(ellipse at top, ${effectiveGlowColor}15, transparent 70%), radial-gradient(ellipse at bottom, ${effectiveGlowColor}10, transparent 70%), linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`
        }}
      >
        {/* Powered By OnHigh Management - Lower Right Corner */}
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.p 
            className="text-xs"
            style={{ color: `${textColor}99` }}
          >
            Impulsionado por
          </motion.p>
          <div className="flex items-center gap-2">
            <motion.img
              src={onHighLogo}
              alt="OnHigh"
              className="h-8 object-contain"
              animate={{
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.p
              className="text-sm font-medium"
              style={{ color: textColor }}
              animate={{
                opacity: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              OnHigh Management
            </motion.p>
          </div>
        </motion.div>

        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${effectiveGlowColor}15 1px, transparent 1px), linear-gradient(90deg, ${effectiveGlowColor}15 1px, transparent 1px)`,
              backgroundSize: "50px 50px",
            }}
            animate={{
              backgroundPosition: ["0px 0px", "50px 50px"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <FloatingParticle
              key={i}
              delay={i * 0.3}
              duration={3 + Math.random() * 2}
              size={4 + Math.random() * 8}
            />
          ))}
        </div>

        {loadingContent}

        {/* Security Message Carousel - Full Width Bottom */}
        <div className="absolute bottom-24 left-0 right-0 overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              x: [0, -2000]
            }}
            transition={{
              opacity: { duration: 0.8, delay: 0.7 },
              x: {
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }
            }}
          >
            {[...Array(15)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 px-8">
                <span className="text-xl font-semibold" style={{ color: textColor }}>
                  Segurança
                </span>
                <span className="text-2xl" style={{ color: primaryColor }}>•</span>
                <span className="text-xl font-semibold" style={{ color: textColor }}>
                  Confidencialidade
                </span>
                <span className="text-2xl" style={{ color: primaryColor }}>•</span>
                <span className="text-xl font-semibold" style={{ color: textColor }}>
                  Privacidade
                </span>
                <span className="text-2xl" style={{ color: primaryColor }}>•</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Modal variant with backdrop
  if (variant === "modal") {
    return (
      <div className={containerClasses.modal} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}>
        <div 
          className="bg-white rounded-lg p-8"
          style={{
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          {loadingContent}
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={containerClasses.inline}>
      {loadingContent}
    </div>
  );
}
