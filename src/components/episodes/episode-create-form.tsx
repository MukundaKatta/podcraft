"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { DocumentUploader } from "@/components/documents/document-uploader";
import { FormatSelector } from "@/components/episodes/format-selector";
import { HostConfigurator } from "@/components/episodes/host-configurator";
import { toast } from "@/hooks/use-toast";
import { getFormatPreset } from "@/lib/format-presets";
import { useSeries } from "@/hooks/use-series";
import type {
  DiscussionFormat,
  HostConfig,
  QualitySettings,
  UploadResponse,
} from "@/types";

const STEPS = ["Content", "Format", "Hosts", "Settings", "Generate"];

export function EpisodeCreateForm() {
  const router = useRouter();
  const { seriesList } = useSeries();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  // Episode data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<DiscussionFormat>("interview");
  const [hostConfig, setHostConfig] = useState<HostConfig>(
    getFormatPreset("interview").defaultHostConfig
  );
  const [qualitySettings, setQualitySettings] = useState<QualitySettings>({
    sampleRate: 44100,
    bitrate: 128,
    format: "mp3",
    speed: 1.0,
    normalizeVolume: true,
  });
  const [seriesId, setSeriesId] = useState<string>("");
  const [documents, setDocuments] = useState<UploadResponse[]>([]);
  const [episodeId, setEpisodeId] = useState<string>("");

  // Create a draft episode first for document uploads
  const ensureEpisodeExists = useCallback(async () => {
    if (episodeId) return episodeId;

    const response = await fetch("/api/episodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || "Untitled Episode",
        description,
        format,
        hostConfig,
        qualitySettings,
        seriesId: seriesId || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create episode");
    }

    const episode = await response.json();
    setEpisodeId(episode.id);
    return episode.id;
  }, [episodeId, title, description, format, hostConfig, qualitySettings, seriesId]);

  const handleFormatChange = (newFormat: DiscussionFormat) => {
    setFormat(newFormat);
    setHostConfig(getFormatPreset(newFormat).defaultHostConfig);
  };

  const handleDocumentAdded = (doc: UploadResponse) => {
    setDocuments((prev) => [...prev, doc]);
  };

  const handleGenerate = async () => {
    if (documents.length === 0) {
      toast({
        title: "No documents",
        description: "Add at least one source document",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled Episode",
          description,
          format,
          hostConfig,
          qualitySettings,
          documentIds: documents.map((d) => d.documentId),
          seriesId: seriesId || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed");
      }

      const result = await response.json();
      toast({
        title: "Generation started",
        description: `Estimated time: ${Math.ceil(result.estimatedTime / 60)} minutes`,
      });
      router.push(`/dashboard/episodes/${result.episodeId}`);
    } catch (err: any) {
      toast({
        title: "Generation failed",
        description: err.message,
        variant: "destructive",
      });
      setGenerating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return title.trim().length > 0;
      case 1:
        return true;
      case 2:
        return hostConfig.host1.name && hostConfig.host2.name;
      case 3:
        return true;
      case 4:
        return documents.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => i < step && setStep(i)}
              className={`font-medium transition-colors ${
                i === step
                  ? "text-primary"
                  : i < step
                  ? "text-foreground cursor-pointer hover:text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Episode Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your episode a compelling title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Description (optional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the episode..."
                rows={3}
              />
            </div>
            {seriesList.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Series (optional)
                </label>
                <Select value={seriesId} onValueChange={setSeriesId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Standalone episode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Standalone episode</SelectItem>
                    {seriesList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Discussion Format</CardTitle>
          </CardHeader>
          <CardContent>
            <FormatSelector selected={format} onSelect={handleFormatChange} />
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Host Personalities</h2>
          <p className="text-sm text-muted-foreground">
            Customize the AI hosts for your podcast. Each host has a unique voice, personality, and speaking style.
          </p>
          <HostConfigurator config={hostConfig} onChange={setHostConfig} />
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">
                Speaking Speed: {qualitySettings.speed.toFixed(1)}x
              </label>
              <Slider
                value={[qualitySettings.speed]}
                onValueChange={([v]) =>
                  setQualitySettings((prev) => ({ ...prev, speed: v }))
                }
                min={0.5}
                max={2.0}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.5x Slow</span>
                <span>1.0x Normal</span>
                <span>2.0x Fast</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Audio Quality
              </label>
              <Select
                value={qualitySettings.bitrate.toString()}
                onValueChange={(v) =>
                  setQualitySettings((prev) => ({
                    ...prev,
                    bitrate: parseInt(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="64">64 kbps - Compact</SelectItem>
                  <SelectItem value="128">128 kbps - Standard</SelectItem>
                  <SelectItem value="192">192 kbps - High Quality</SelectItem>
                  <SelectItem value="320">320 kbps - Maximum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Output Format
              </label>
              <Select
                value={qualitySettings.format}
                onValueChange={(v: any) =>
                  setQualitySettings((prev) => ({ ...prev, format: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="ogg">OGG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Source Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUploader
                episodeId={episodeId || "pending"}
                onDocumentAdded={handleDocumentAdded}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Episode Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Title:</span>{" "}
                  {title || "Untitled"}
                </div>
                <div>
                  <span className="text-muted-foreground">Format:</span>{" "}
                  {format}
                </div>
                <div>
                  <span className="text-muted-foreground">Hosts:</span>{" "}
                  {hostConfig.host1.name} & {hostConfig.host2.name}
                </div>
                <div>
                  <span className="text-muted-foreground">Documents:</span>{" "}
                  {documents.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={async () => {
              if (step === 3) {
                // Before going to documents step, ensure episode exists
                try {
                  await ensureEpisodeExists();
                } catch {
                  toast({
                    title: "Error",
                    description: "Failed to initialize episode",
                    variant: "destructive",
                  });
                  return;
                }
              }
              setStep(step + 1);
            }}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={generating || documents.length === 0}
            className="gradient-podcast border-0 text-white hover:opacity-90"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Episode
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
