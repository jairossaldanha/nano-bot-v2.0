import { Building2, Save, FileText, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type CompanyTab = "identity" | "policies";

export function CompanyPage() {
  const [activeTab, setActiveTab] = useState<CompanyTab>("identity");
  const [soulContent, setSoulContent] = useState(
    "# Identity\n\nYou are the corporate AI assistant.\n\n## Tone\n- Professional but approachable\n- Use \"we\" when referring to the company\n\n## Brand Voice\n- Concise and direct\n- Always sign off formally in client-facing documents",
  );
  const [policyContent, setPolicyContent] = useState(
    "# Company Policies\n\n## Data Protection\n- Never expose client personal data\n- PII must be redacted from reports\n\n## Document Standards\n- All documents must include company header\n- Use DD/MM/YYYY date format\n- Currency in BRL unless specified",
  );

  const tabs = [
    { id: "identity" as CompanyTab, label: "Identity (SOUL.md)", icon: FileText },
    { id: "policies" as CompanyTab, label: "Policies", icon: Shield },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold">Company Core</h2>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          Save Changes
        </Button>
      </div>
      <div className="flex gap-0 border-b border-border px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-6">
          {activeTab === "identity" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Agent Identity</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Define the agent&apos;s personality and brand guidelines. Injected as SOUL.md.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Company Name</label>
                <Input placeholder="Your Company" defaultValue="RAPR" className="h-8 text-sm" />
              </div>
              <Separator />
              <textarea
                value={soulContent}
                onChange={(e) => setSoulContent(e.target.value)}
                className="h-80 w-full resize-y rounded-lg border border-border bg-accent/20 p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          {activeTab === "policies" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Company Policies</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Strict rules injected with maximum priority. Cannot be bypassed.
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Policies override all other instructions, even if the user asks to bypass them.
                </p>
              </div>
              <textarea
                value={policyContent}
                onChange={(e) => setPolicyContent(e.target.value)}
                className="h-96 w-full resize-y rounded-lg border border-border bg-accent/20 p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
