import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const availableTags = [
  "Útil",
  "Esclarecedor",
  "Profissional",
  "Atencioso",
  "Prático",
  "Não Recomendaria",
  "Confuso",
  "Breve Demais",
];

export function TagSelector({ selectedTags, onTagToggle }: TagSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Etiquetas (opcional)</label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                isSelected && "shadow-sm"
              )}
              onClick={() => onTagToggle(tag)}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
