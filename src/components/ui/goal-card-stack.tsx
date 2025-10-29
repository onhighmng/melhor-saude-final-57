import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GoalCard = {
  id: number;
  title: string;
  pillar: string;
  progress: number;
  sessions: string;
  emojis: string[];
};

export const GoalCardStack = ({
  items,
  offset = 10,
  scaleFactor = 0.06,
}: {
  items: GoalCard[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const [cards, setCards] = useState<GoalCard[]>(items);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPillarColor = (pillar: string) => {
    switch (pillar) {
      case 'saude_mental':
        return 'from-blue-500 to-blue-600';
      case 'assistencia_juridica':
        return 'from-purple-500 to-purple-600';
      case 'assistencia_financeira':
        return 'from-green-500 to-green-600';
      case 'bem_estar_fisico':
        return 'from-amber-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="relative mx-auto h-48 w-full md:h-48 md:w-96 my-4">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute bg-card h-48 w-full md:h-48 md:w-96 rounded-3xl p-4 shadow-xl border border-border flex flex-col justify-between"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -offset,
              scale: 1 - index * scaleFactor,
              zIndex: cards.length - index,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground text-sm">{card.title}</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{card.progress}% alcançado</span>
                  <div className="flex gap-1">
                    {card.emojis.slice(0, 5).map((emoji, i) => (
                      <span key={i} className="text-sm">{emoji}</span>
                    ))}
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full bg-gradient-to-r transition-all", getPillarColor(card.pillar))}
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{card.sessions}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
