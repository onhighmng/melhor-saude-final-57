import { ReactNode, memo } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = memo(({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      className={cn(
        "grid w-full h-full min-h-0 grid-cols-3 gap-4",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
});

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  onClick,
  iconColor,
  textColor,
  descriptionColor,
  iconSize,
  nameSize,
  descriptionSize,
  children,
  style,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon?: React.ComponentType<{className?: string; style?: React.CSSProperties}>;
  description: string;
  href: string;
  cta: string;
  onClick?: () => void;
  iconColor?: string;
  textColor?: string;
  descriptionColor?: string;
  iconSize?: number;
  nameSize?: string;
  descriptionSize?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl cursor-pointer",
      // light styles
      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className,
    )}
    style={style}
    onClick={onClick}
  >
    <div>{background}</div>
    {children ? (
      <div className="relative z-20">{children}</div>
    ) : (
      <>
        <div className="pointer-events-none z-20 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
          {Icon && <Icon className={cn("origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75", iconColor)} style={{ width: iconSize || 48, height: iconSize || 48 }} />}
          <h3 className={cn("font-semibold text-neutral-700 dark:text-neutral-300", nameSize || "text-xl", textColor)}>
            {name}
          </h3>
          <p className={cn("max-w-lg text-neutral-400", descriptionSize || "text-base", descriptionColor)}>{description}</p>
        </div>
        
        {cta && (
          <div
            className={cn(
              "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-30",
            )}
          >
            <Button variant="ghost" size="sm" className="pointer-events-none">
              <span>
                {cta}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>
        )}
      </>
    )}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
);

export { BentoCard, BentoGrid };