"use client";;
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-blue-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500"
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[200px] w-[26rem] max-w-[26rem] -skew-y-[8deg] select-none flex-col rounded-xl border-2 bg-muted/70 dark:bg-neutral-800/70 backdrop-blur-sm px-6 py-5 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[24rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-white/20 dark:hover:border-neutral-600/20 hover:bg-muted dark:hover:bg-neutral-800 gap-3",
        className
      )}>
      <div className="flex items-start gap-3">
        <span className="relative inline-block rounded-full bg-blue-800 dark:bg-blue-700 p-1.5 flex-shrink-0 mt-0.5">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-base font-semibold leading-snug break-words", titleClassName)}>{title}</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 flex-1 break-words">{description}</p>
      <p className="text-xs text-muted-foreground dark:text-gray-400 mt-auto">{date}</p>
    </div>
  );
}

export default function DisplayCards({
  cards
}) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration:700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div
      className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700 min-h-[450px] py-12 px-4">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}