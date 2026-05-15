import {
  FolderOpen,
  File,
  FileText,
  FileCode,
  Image,
  Download,
  Eye,
  ChevronRight,
  Home,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileItem {
  name: string;
  type: "file" | "directory";
  size?: string;
  modified?: string;
  extension?: string;
}

const MOCK_FILES: FileItem[] = [
  { name: "memory", type: "directory" },
  { name: "skills", type: "directory" },
  {
    name: "SOUL.md",
    type: "file",
    size: "2.1 KB",
    modified: "2026-05-14",
    extension: "md",
  },
  {
    name: "USER.md",
    type: "file",
    size: "1.4 KB",
    modified: "2026-05-14",
    extension: "md",
  },
  {
    name: "report_vendas_q2.pdf",
    type: "file",
    size: "342 KB",
    modified: "2026-05-13",
    extension: "pdf",
  },
  {
    name: "análise_concorrência.md",
    type: "file",
    size: "8.7 KB",
    modified: "2026-05-12",
    extension: "md",
  },
  {
    name: "logo_rapr.png",
    type: "file",
    size: "156 KB",
    modified: "2026-05-10",
    extension: "png",
  },
  {
    name: "script_automação.py",
    type: "file",
    size: "3.2 KB",
    modified: "2026-05-09",
    extension: "py",
  },
];

function getFileIcon(item: FileItem) {
  if (item.type === "directory")
    return <FolderOpen className="h-4 w-4 text-amber-500" />;
  switch (item.extension) {
    case "md":
    case "txt":
    case "pdf":
      return <FileText className="h-4 w-4 text-blue-400" />;
    case "py":
    case "js":
    case "ts":
    case "tsx":
      return <FileCode className="h-4 w-4 text-emerald-400" />;
    case "png":
    case "jpg":
    case "webp":
    case "svg":
      return <Image className="h-4 w-4 text-pink-400" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
}

export function FilesPage() {
  const [path] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const breadcrumb = ["workspace", ...path];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold">Workspace Files</h2>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 border-b border-border px-6 py-2">
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-1.5 text-xs">
          <Home className="h-3 w-3" />
        </Button>
        {breadcrumb.map((part, i) => (
          <div key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{part}</span>
          </div>
        ))}
      </div>

      {/* File list */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/50">
          {MOCK_FILES.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelected(item.name)}
              className={`flex w-full items-center gap-3 px-6 py-2.5 text-left transition-colors ${
                selected === item.name ? "bg-primary/5" : "hover:bg-accent/50"
              }`}
            >
              {getFileIcon(item)}
              <span className="flex-1 truncate text-sm">{item.name}</span>
              {item.size && (
                <span className="text-xs text-muted-foreground">
                  {item.size}
                </span>
              )}
              {item.modified && (
                <span className="text-xs text-muted-foreground">
                  {item.modified}
                </span>
              )}
              {item.type === "file" && (
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Status bar */}
      <div className="border-t border-border px-6 py-2">
        <p className="text-[11px] text-muted-foreground">
          {MOCK_FILES.length} items ·{" "}
          {MOCK_FILES.filter((f) => f.type === "directory").length} folders ·{" "}
          {MOCK_FILES.filter((f) => f.type === "file").length} files
        </p>
      </div>
    </div>
  );
}
