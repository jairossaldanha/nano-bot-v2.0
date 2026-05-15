import { Clock, Plus, Trash2, Play, Pause, Power } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  command: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

const MOCK_JOBS: CronJob[] = [
  {
    id: "1",
    name: "Weekly Sales Report",
    schedule: "0 8 * * MON",
    command: "Generate a sales summary for last week and save to workspace",
    enabled: true,
    lastRun: "2026-05-12 08:00",
    nextRun: "2026-05-19 08:00",
  },
  {
    id: "2",
    name: "Daily News Digest",
    schedule: "0 7 * * *",
    command: "Research trending industry news and prepare a digest",
    enabled: true,
    lastRun: "2026-05-15 07:00",
    nextRun: "2026-05-16 07:00",
  },
  {
    id: "3",
    name: "Monthly Competitor Analysis",
    schedule: "0 9 1 * *",
    command: "Analyze our top 3 competitors and generate SWOT report",
    enabled: false,
    lastRun: "2026-05-01 09:00",
  },
];

export function CronPage() {
  const [jobs] = useState<CronJob[]>(MOCK_JOBS);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold">Cron Jobs</h2>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Plus className="h-3 w-3" />
          New Job
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-3 px-6 py-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`rounded-xl border p-4 transition-colors ${
                job.enabled
                  ? "border-border bg-card"
                  : "border-border/50 bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${job.enabled ? "bg-emerald-400" : "bg-muted-foreground/30"}`}
                    />
                    <h3 className="text-sm font-semibold">{job.name}</h3>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {job.command}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="rounded-md bg-accent px-2 py-0.5 font-mono">
                      {job.schedule}
                    </span>
                    {job.lastRun && <span>Last: {job.lastRun}</span>}
                    {job.nextRun && <span>Next: {job.nextRun}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Play className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    {job.enabled ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Power className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
