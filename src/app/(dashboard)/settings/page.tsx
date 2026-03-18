"use client";

import { useState } from "react";
import { Save, Key, Volume2, Globe } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [defaultSpeed, setDefaultSpeed] = useState(1.0);
  const [defaultFormat, setDefaultFormat] = useState("mp3");
  const [defaultBitrate, setDefaultBitrate] = useState("128");

  const handleSave = () => {
    // In production, save to user preferences in Supabase
    toast({ title: "Settings saved" });
  };

  return (
    <div>
      <Header
        title="Settings"
        description="Configure your PodCraft preferences"
      />

      <div className="p-6 max-w-2xl space-y-6">
        {/* Default Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Volume2 className="w-5 h-5" />
              Default Audio Settings
            </CardTitle>
            <CardDescription>
              These defaults apply to all new episodes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">
                Default Speed: {defaultSpeed.toFixed(1)}x
              </label>
              <Slider
                value={[defaultSpeed]}
                onValueChange={([v]) => setDefaultSpeed(v)}
                min={0.5}
                max={2.0}
                step={0.1}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Default Quality
              </label>
              <Select value={defaultBitrate} onValueChange={setDefaultBitrate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="64">64 kbps - Compact</SelectItem>
                  <SelectItem value="128">128 kbps - Standard</SelectItem>
                  <SelectItem value="192">192 kbps - High</SelectItem>
                  <SelectItem value="320">320 kbps - Maximum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Default Format
              </label>
              <Select value={defaultFormat} onValueChange={setDefaultFormat}>
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

        {/* RSS Feed Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5" />
              RSS Feed Defaults
            </CardTitle>
            <CardDescription>
              Default values for RSS feed generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Author Name
              </label>
              <Input placeholder="Your name or organization" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Contact Email
              </label>
              <Input type="email" placeholder="podcasts@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Default Category
              </label>
              <Select defaultValue="Technology">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Health">Health & Fitness</SelectItem>
                  <SelectItem value="Society">Society & Culture</SelectItem>
                  <SelectItem value="News">News</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="w-5 h-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              API keys are stored as environment variables on the server
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                OpenAI API Key
              </label>
              <Input
                type="password"
                value="sk-****************************"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Configured via OPENAI_API_KEY environment variable
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Supabase URL
              </label>
              <Input
                type="text"
                value={process.env.NEXT_PUBLIC_SUPABASE_URL || "Not configured"}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
