import { Bot, Plus, MessageSquare, Settings2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface SubagentProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  model?: string;
  isActive: boolean;
}

const MOCK_AGENTS: SubagentProfile[] = [
  {
    id: "marketing",
    name: "Marketing Agent",
    role: "Marketing Specialist",
    description:
      "Handles content strategy, social media copy, and brand communications.",
    systemPrompt:
      "You are a marketing specialist for our company. Follow our brand guidelines...",
    isActive: true,
  },
  {
    id: "finance",
    name: "Financial Analyst",
    role: "Finance & Reporting",
    description:
      "Generates financial reports, analyzes budgets, and tracks KPIs.",
    systemPrompt: "You are a financial analyst. Always use precise numbers...",
    isActive: true,
  },
  {
    id: "hr",
    name: "HR Assistant",
    role: "Human Resources",
    description:
      "Assists with job descriptions, onboarding docs, and policy questions.",
    systemPrompt:
      "You are an HR assistant. Always follow labor law guidelines...",
    isActive: false,
  },
];

export function SubagentsPage() {
  const [agents] = useState<SubagentProfile[]>(MOCK_AGENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = agents.find((a) => a.id === selectedId);

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="flex w-80 flex-col border-r border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">Subagents</h2>
          </div>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" />
            New
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 px-2 py-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedId(agent.id)}
                className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${
                  selectedId === agent.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${agent.isActive ? "bg-emerald-400" : "bg-muted-foreground/30"}`}
                  />
                  <p className="text-sm font-medium">{agent.name}</p>
                </div>
                <p className="mt-0.5 pl-4 text-xs text-muted-foreground">
                  {agent.role}
                </p>
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
                <h3 className="text-base font-semibold">{selected.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {selected.role} ·{" "}
                  {selected.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="h-3.5 w-3.5" />
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
                    Description
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {selected.description}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    System Prompt
                  </h4>
                  <textarea
                    readOnly
                    value={selected.systemPrompt}
                    className="h-32 w-full resize-none rounded-lg border border-border bg-accent/30 p-3 font-mono text-xs leading-relaxed"
                  />
                </div>
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Model Override
                  </h4>
                  <Input
                    placeholder="Use default model"
                    value={selected.model || ""}
                    readOnly
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                Select an agent or create a new one
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Subagents are ephemeral personas that inherit company policies
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
