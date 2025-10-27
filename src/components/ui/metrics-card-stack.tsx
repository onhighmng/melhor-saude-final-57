"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ArrowRight, BarChart3 } from "lucide-react";

type MetricCard = {
  id: number;
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  iconBg: string;
  textColor: string;
};

export const MetricsCardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: MetricCard[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<MetricCard[]>(items);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards: MetricCard[]) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-64 w-full max-w-sm mx-auto">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className={`absolute ${card.bgColor} h-64 w-full rounded-3xl p-6 shadow-xl border border-neutral-200 dark:border-white/[0.1] flex flex-col justify-between`}
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: cards.length - index,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {card.title}
              </p>
              <p className={`text-5xl font-bold ${card.textColor} mb-4`}>
                {card.value}
              </p>
            </div>
            <div className="flex justify-end">
              <div className={`${card.iconBg} p-3 rounded-full`}>
                {card.icon}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};


