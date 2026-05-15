import { Puzzle, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Integration {
  id: string;
  name: string;
  type: "skill" | "mcp";
  description: string;
  enabled: boolean;
  hasSchema: boolean;
}

const MOCK: Integration[] = [
  { id: "memory", name: "memory", type: "skill", description: "Two-layer memory system with Dream-managed knowledge files.", enabled: true, hasSchema: true },
  { id: "skill-creator", name: "skill-creator", type: "skill", description: "Create or update AgentSkills.", enabled: true, hasSchema: true },
  { id: "web-search", name: "web_search", type: "skill", description: "Search the web and return summarized results.", enabled: true, hasSchema: false },
  { id: "supabase", name: "supabase-mcp", type: "mcp", description: "Database management and queries via Supabase.", enabled: true, hasSchema: false },
  { id: "github", name: "github-mcp", type: "mcp", description: "Repository management and code search.", enabled: false, hasSchema: false },
];

export function IntegrationsPage() {
  const [items] = useState<Integration[]>(MOCK);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold">Skills & MCPs</h2>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl space-y-3 px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills</h3>
          {items.filter(i => i.type === "skill").map(item => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.hasSchema && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">schema</span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              </div>
              {item.enabled ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-muted-foreground/30" />
              )}
            </div>
          ))}
          <h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">MCP Servers</h3>
          {items.filter(i => i.type === "mcp").map(item => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex-1">
                <span className="text-sm font-medium">{item.name}</span>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ExternalLink className="h-3 w-3" />
              </Button>
              {item.enabled ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 shrink-0 text-muted-foreground/30" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
