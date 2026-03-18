"use client";

import { useState } from "react";
import { User, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { HostConfig, HostPersonality } from "@/types";

const VOICES = [
  { id: "alloy", label: "Alloy", description: "Neutral, balanced" },
  { id: "echo", label: "Echo", description: "Warm, thoughtful" },
  { id: "fable", label: "Fable", description: "Expressive, dynamic" },
  { id: "onyx", label: "Onyx", description: "Deep, authoritative" },
  { id: "nova", label: "Nova", description: "Bright, energetic" },
  { id: "shimmer", label: "Shimmer", description: "Clear, friendly" },
];

const ROLES = ["host", "guest", "expert", "interviewer", "moderator"] as const;

interface HostConfiguratorProps {
  config: HostConfig;
  onChange: (config: HostConfig) => void;
}

export function HostConfigurator({ config, onChange }: HostConfiguratorProps) {
  const updateHost = (
    hostKey: "host1" | "host2",
    field: keyof HostPersonality,
    value: any
  ) => {
    onChange({
      ...config,
      [hostKey]: {
        ...config[hostKey],
        [field]: value,
      },
    });
  };

  const updateExpertise = (hostKey: "host1" | "host2", expertiseStr: string) => {
    const expertise = expertiseStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    updateHost(hostKey, "expertise", expertise);
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {(["host1", "host2"] as const).map((hostKey, index) => {
        const host = config[hostKey];
        return (
          <Card key={hostKey}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                Host {index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Name
                </label>
                <Input
                  value={host.name}
                  onChange={(e) => updateHost(hostKey, "name", e.target.value)}
                  placeholder="Host name"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Role
                </label>
                <Select
                  value={host.role}
                  onValueChange={(v) => updateHost(hostKey, "role", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  Voice
                </label>
                <Select
                  value={host.voice}
                  onValueChange={(v) => updateHost(hostKey, "voice", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.label} - {voice.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Personality
                </label>
                <Textarea
                  value={host.personality}
                  onChange={(e) =>
                    updateHost(hostKey, "personality", e.target.value)
                  }
                  rows={2}
                  placeholder="Describe the host's personality..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Speaking Style
                </label>
                <Input
                  value={host.speakingStyle}
                  onChange={(e) =>
                    updateHost(hostKey, "speakingStyle", e.target.value)
                  }
                  placeholder="e.g., Conversational, energetic"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Expertise (comma-separated)
                </label>
                <Input
                  value={host.expertise.join(", ")}
                  onChange={(e) => updateExpertise(hostKey, e.target.value)}
                  placeholder="e.g., technology, science"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {host.expertise.map((exp) => (
                    <Badge key={exp} variant="secondary" className="text-xs">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
