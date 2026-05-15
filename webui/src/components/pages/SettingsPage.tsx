import { Settings, Key, Cpu, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  const [model, setModel] = useState("openrouter/anthropic/claude-sonnet-4");
  const [apiKey, setApiKey] = useState("sk-or-••••••••••••••••••••");

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-3">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold">Settings</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl space-y-8 px-6 py-6">
          {/* Model */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Language Model</h3>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Model ID</label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} className="h-8 font-mono text-xs" />
            </div>
          </div>
          <Separator />
          {/* API Key */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">API Key</h3>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">OpenRouter / Provider Key</label>
              <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="h-8 font-mono text-xs" />
            </div>
          </div>
          <Separator />
          {/* Connection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Connection</h3>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Backend API URL</label>
              <Input defaultValue="http://127.0.0.1:8765" readOnly className="h-8 font-mono text-xs bg-muted/30" />
            </div>
          </div>
          <div className="pt-4">
            <Button className="w-full">Save Settings</Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
