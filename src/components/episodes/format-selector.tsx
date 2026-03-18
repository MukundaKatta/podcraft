"use client";

import { Mic2, Swords, Lightbulb, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { FORMAT_PRESETS } from "@/lib/format-presets";
import type { DiscussionFormat } from "@/types";

const formatIcons: Record<string, React.ElementType> = {
  mic: Mic2,
  swords: Swords,
  lightbulb: Lightbulb,
  helpCircle: HelpCircle,
};

interface FormatSelectorProps {
  selected: DiscussionFormat;
  onSelect: (format: DiscussionFormat) => void;
}

export function FormatSelector({ selected, onSelect }: FormatSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FORMAT_PRESETS.map((preset) => {
        const Icon = formatIcons[preset.icon] || Mic2;
        const isSelected = selected === preset.id;

        return (
          <Card
            key={preset.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-primary border-primary"
            )}
            onClick={() => onSelect(preset.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    isSelected
                      ? "gradient-podcast"
                      : "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isSelected ? "text-white" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <p className="font-medium text-sm">{preset.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
