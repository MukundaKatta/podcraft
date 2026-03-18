"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Plus, Headphones, Filter } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EpisodeCard } from "@/components/episodes/episode-card";
import { EpisodeCreateForm } from "@/components/episodes/episode-create-form";
import { useEpisodes } from "@/hooks/use-episodes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function EpisodesPage() {
  const searchParams = useSearchParams();
  const showNew = searchParams.get("new") === "true";
  const [creating, setCreating] = useState(showNew);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { episodes, loading, deleteEpisode, refetch } = useEpisodes();

  const filteredEpisodes =
    statusFilter === "all"
      ? episodes
      : episodes.filter((e) => e.status === statusFilter);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this episode?")) return;
    const success = await deleteEpisode(id);
    if (success) {
      toast({ title: "Episode deleted" });
    } else {
      toast({
        title: "Delete failed",
        variant: "destructive",
      });
    }
  };

  if (creating) {
    return (
      <div>
        <Header
          title="Create Episode"
          description="Generate an AI podcast episode from your documents"
          actions={
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
          }
        />
        <div className="p-6">
          <EpisodeCreateForm />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Episodes"
        description={`${episodes.length} episodes`}
        actions={
          <Button
            onClick={() => setCreating(true)}
            className="gradient-podcast border-0 text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Episode
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Episodes list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredEpisodes.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Headphones className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-medium">No episodes yet</p>
            <p className="text-sm mt-2">
              Create your first AI-powered podcast episode
            </p>
            <Button className="mt-6" onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Episode
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEpisodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
