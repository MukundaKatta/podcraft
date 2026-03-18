"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Library } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { SeriesCard } from "@/components/series/series-card";
import { SeriesCreateDialog } from "@/components/series/series-create-dialog";
import { useSeries } from "@/hooks/use-series";
import { toast } from "@/hooks/use-toast";

export default function SeriesPage() {
  const searchParams = useSearchParams();
  const showNew = searchParams.get("new") === "true";
  const [dialogOpen, setDialogOpen] = useState(showNew);
  const { seriesList, loading, deleteSeries, refetch } = useSeries();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this series? Episodes will not be deleted.")) return;
    const success = await deleteSeries(id);
    if (success) {
      toast({ title: "Series deleted" });
    } else {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <div>
      <Header
        title="Series"
        description={`${seriesList.length} podcast series`}
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="gradient-podcast border-0 text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Series
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : seriesList.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Library className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl font-medium">No series yet</p>
            <p className="text-sm mt-2">
              Create a series to organize your episodes and generate RSS feeds
            </p>
            <Button className="mt-6" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Series
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {seriesList.map((series) => (
              <SeriesCard
                key={series.id}
                series={series}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <SeriesCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={refetch}
      />
    </div>
  );
}
