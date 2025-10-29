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
  // Filter out invalid items on initialization
  const validInitialItems = items.filter((item): item is GoalCard => 
    item != null && 
    typeof item === 'object' && 
    'id' in item && 
    'title' in item && 
    'pillar' in item &&
    'progress' in item &&
    'sessions' in item &&
    'emojis' in item
  );
  const [cards, setCards] = useState<GoalCard[]>(validInitialItems);

  // Update cards when items prop changes
  useEffect(() => {
    const validItems = items.filter((item): item is GoalCard => 
      item != null && 
      typeof item === 'object' && 
      'id' in item && 
      'title' in item && 
      'pillar' in item &&
      'progress' in item &&
      'sessions' in item &&
      'emojis' in item
    );
    setCards(validItems);
  }, [items]);

  useEffect(() => {
    if (cards.length === 0) return;
    
    const interval = setInterval(() => {
      setCards((prevCards) => {
        if (prevCards.length === 0) return prevCards;
        const newArray = [...prevCards];
        const lastItem = newArray.pop();
        if (lastItem) {
          newArray.unshift(lastItem);
        }
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [cards.length]);

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

  // Filter out any undefined/null cards to prevent errors
  const validCards = cards.filter((card): card is GoalCard => 
    card != null && 
    typeof card === 'object' && 
    'id' in card && 
    'title' in card && 
    'pillar' in card &&
    'progress' in card &&
    'sessions' in card &&
    'emojis' in card
  );

  if (validCards.length === 0) {
    return (
      <div className="relative mx-auto h-48 w-full md:h-48 md:w-96 my-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Nenhum objetivo disponível</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-48 w-full md:h-48 md:w-96 my-4">
      {validCards.map((card, index) => {
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
              zIndex: validCards.length - index,
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
