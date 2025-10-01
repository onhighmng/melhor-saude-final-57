import { memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  event: string;
  subject: string;
  body: string;
  isActive: boolean;
  lastModified: string;
}

interface OptimizedEmailTemplatesProps {
  templates: EmailTemplate[];
  selectedTemplate: EmailTemplate | null;
  onSelectTemplate: (template: EmailTemplate) => void;
  getEventInfo: (eventType: string) => any;
}

const TemplateCard = memo(({ 
  template, 
  isSelected, 
  onSelect, 
  eventInfo 
}: {
  template: EmailTemplate;
  isSelected: boolean;
  onSelect: () => void;
  eventInfo: any;
}) => {
  const IconComponent = eventInfo.icon;
  
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${eventInfo.color}`}></div>
            <h3 className="font-medium text-sm">{template.name}</h3>
          </div>
          <Badge variant={template.isActive ? "default" : "secondary"} className="text-xs">
            {template.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <IconComponent className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{eventInfo.label}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.subject}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            Mod: {template.lastModified}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

TemplateCard.displayName = "TemplateCard";

export const OptimizedEmailTemplates = memo(({ 
  templates, 
  selectedTemplate, 
  onSelectTemplate, 
  getEventInfo 
}: OptimizedEmailTemplatesProps) => {
  const templateCards = useMemo(() => 
    templates.map((template) => {
      const eventInfo = getEventInfo(template.event);
      const isSelected = selectedTemplate?.id === template.id;
      
      return (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={isSelected}
          eventInfo={eventInfo}
          onSelect={() => onSelectTemplate(template)}
        />
      );
    }), [templates, selectedTemplate?.id, onSelectTemplate, getEventInfo]
  );

  return <div className="space-y-3">{templateCards}</div>;
});

OptimizedEmailTemplates.displayName = "OptimizedEmailTemplates";