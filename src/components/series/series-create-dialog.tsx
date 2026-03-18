"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormatSelector } from "@/components/episodes/format-selector";
import { toast } from "@/hooks/use-toast";
import type { DiscussionFormat } from "@/types";

interface SeriesCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function SeriesCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: SeriesCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [defaultFormat, setDefaultFormat] = useState<DiscussionFormat>("interview");
  const [isPublic, setIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setCreating(true);
    try {
      const response = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          defaultFormat,
          isPublic,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create series");
      }

      toast({ title: "Series created", description: title });
      setTitle("");
      setDescription("");
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast({
        title: "Failed to create series",
        description: err.message,
        variant: "destructive",
      });
    }
    setCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Series</DialogTitle>
          <DialogDescription>
            Organize your episodes into a series with its own RSS feed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Podcast Series"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this series about?"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Default Format
            </label>
            <Select
              value={defaultFormat}
              onValueChange={(v) => setDefaultFormat(v as DiscussionFormat)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="debate">Debate</SelectItem>
                <SelectItem value="explainer">Explainer</SelectItem>
                <SelectItem value="qna">Q&A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Visibility
            </label>
            <Select
              value={isPublic ? "public" : "private"}
              onValueChange={(v) => setIsPublic(v === "public")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public (with RSS feed)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !title.trim()}>
            {creating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Create Series
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
