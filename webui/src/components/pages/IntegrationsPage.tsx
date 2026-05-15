import { Puzzle, CheckCircle2, XCircle, ExternalLink, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApiQuery } from "@/hooks/useApiQuery";

interface SkillItem {
  name: string;
  source: string;
  description: string;
  available: boolean;
  always: boolean;
}

interface McpServerItem {
  type: string;
  command?: string;
  url?: string;
  enabled_tools: string[];
}

interface ConfigPayload {
  mcp_servers: Record<string, McpServerItem>;
}

interface SkillsPayload {
  skills: SkillItem[];
}

export function IntegrationsPage() {
  const { data: configData, loading: configLoading } = useApiQuery<ConfigPayload>("/api/config");
  const { data: skillsData, loading: skillsLoading } = useApiQuery<SkillsPayload>("/api/skills");

  const skills = useMemo(() => skillsData?.skills || [], [skillsData]);
  const mcpServers = useMemo(() => {
    if (!configData?.mcp_servers) return [];
    return Object.entries(configData.mcp_servers).map(([name, srv]) => ({
      name,
      ...srv,
    }));
  }, [configData]);

  const loading = configLoading || skillsLoading;

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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
            </div>
          ) : (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills</h3>
              {skills.map(item => (
                <div key={item.name} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      {item.always && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">always active</span>
                      )}
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{item.source}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  {item.available ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-destructive/60" />
                  )}
                </div>
              ))}
              {skills.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No skills found in workspace or builtin directory.
                </div>
              )}

              <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">MCP Servers</h3>
              {mcpServers.map(item => (
                <div key={item.name} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{item.type}</span>
                    </div>
                    <p className="mt-0.5 text-xs font-mono text-muted-foreground">
                      {item.type === "stdio" ? item.command : item.url}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                </div>
              ))}
              {mcpServers.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No MCP servers configured.
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
