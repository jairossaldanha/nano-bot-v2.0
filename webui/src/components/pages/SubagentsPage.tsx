import { Bot, Info, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useApiQuery } from "@/hooks/useApiQuery";

interface AgentDefaults {
  model: string;
  provider: string;
  workspace: string;
  max_tokens: number;
  temperature: number;
  timezone: string;
}

interface ConfigPayload {
  agents: {
    defaults: AgentDefaults;
  };
}

export function SubagentsPage() {
  const { data, loading } = useApiQuery<ConfigPayload>("/api/config");

  const defaults = data?.agents?.defaults;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-4">
        <Bot className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Agents & Architecture</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl space-y-8 px-6 py-8">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-500/80">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0" />
              <p>
                <strong>Dynamic Architecture.</strong> In Nanobot OS, subagents are not static profiles. 
                The primary Agent creates ephemeral subagents on-the-fly based on the task requirements, 
                granting them specific skills and context needed for the job.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Default Agent Configuration</h3>
            <div className="rounded-xl border border-border bg-card">
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model</div>
                  <div className="mt-1 font-medium">{defaults?.model || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Provider</div>
                  <div className="mt-1 font-medium">{defaults?.provider || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Temperature</div>
                  <div className="mt-1 font-medium">{defaults?.temperature ?? "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Tokens</div>
                  <div className="mt-1 font-medium">{defaults?.max_tokens || "N/A"}</div>
                </div>
              </div>
              <Separator />
              <div className="p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace Path</div>
                <div className="mt-1 font-mono text-sm text-muted-foreground">{defaults?.workspace || "N/A"}</div>
              </div>
              <Separator />
              <div className="p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timezone</div>
                <div className="mt-1 font-medium">{defaults?.timezone || "UTC"}</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
