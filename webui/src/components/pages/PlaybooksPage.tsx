import { BookOpen, Play, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Playbook {
  id: number;
  timestamp: string;
  task_type: string;
  summary: string;
  steps: string[];
  skills_used: string[];
  outcome: string;
  tags: string[];
}

const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: 1,
    timestamp: "2026-05-14T10:30:00",
    task_type: "coding",
    summary: "Deploy Next.js app with authentication",
    steps: [
      "Scaffold project with create-next-app",
      "Configure auth provider (NextAuth)",
      "Set up protected routes",
      "Deploy to Vercel",
    ],
    skills_used: ["web-development", "deployment"],
    outcome: "success",
    tags: ["nextjs", "auth", "deploy"],
  },
  {
    id: 2,
    timestamp: "2026-05-13T15:00:00",
    task_type: "analysis",
    summary: "Competitive market analysis report",
    steps: [
      "Research top 5 competitors",
      "Analyze pricing models",
      "Compare feature sets",
      "Generate SWOT matrix",
      "Write executive summary",
    ],
    skills_used: ["research", "writing"],
    outcome: "success",
    tags: ["market", "analysis", "report"],
  },
];

export function PlaybooksPage() {
  const [search, setSearch] = useState("");
  const [playbooks] = useState<Playbook[]>(MOCK_PLAYBOOKS);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = playbooks.filter(
    (pb) =>
      pb.summary.toLowerCase().includes(search.toLowerCase()) ||
      pb.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  const selected = playbooks.find((pb) => pb.id === selectedId);

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="flex w-80 flex-col border-r border-border">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold">Procedural Playbooks</h2>
        </div>
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search playbooks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 px-2 py-1">
            {filtered.length === 0 && (
              <p className="px-2 py-8 text-center text-xs text-muted-foreground">
                No playbooks found. They are generated automatically by the
                Dream process after successful complex tasks.
              </p>
            )}
            {filtered.map((pb) => (
              <button
                key={pb.id}
                onClick={() => setSelectedId(pb.id)}
                className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                  selectedId === pb.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                }`}
              >
                <p className="text-sm font-medium leading-snug">
                  {pb.summary}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                    {pb.task_type}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {pb.steps.length} steps
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Detail */}
      <div className="flex flex-1 flex-col">
        {selected ? (
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <div>
                <h3 className="text-base font-semibold">{selected.summary}</h3>
                <p className="text-xs text-muted-foreground">
                  {selected.task_type} · learned{" "}
                  {new Date(selected.timestamp).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  Execute
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="max-w-xl space-y-6">
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Steps
                  </h4>
                  <ol className="space-y-2">
                    {selected.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Skills Used
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.skills_used.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                Select a playbook to view details
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Playbooks are generated by Dream from your successful tasks
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
