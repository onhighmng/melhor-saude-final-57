import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const CardStack = ({
  items,
  offset = 10,
  scaleFactor = 0.06,
}: {
  items: Array<{
    id: number;
    name: string;
    designation: string;
    content: React.ReactNode;
  }>;
  offset?: number;
  scaleFactor?: number;
}) => {
  const [cards, setCards] = useState(items);

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

  return (
    <div className="relative h-[400px] w-full">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute bg-card border border-border rounded-3xl p-8 shadow-xl w-full"
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
              <p className="text-3xl font-bold text-foreground">{card.name}</p>
              <p className="text-lg text-muted-foreground font-medium">
                {card.designation}
              </p>
              <div className="mt-6">{card.content}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
