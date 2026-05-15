import {
  Bot,
  BookOpen,
  FolderOpen,
  Clock,
  Building2,
  Puzzle,
  Settings,
  MessageSquare,
  Moon,
  Sun,
  PanelLeftClose,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type NavSection =
  | "chat"
  | "subagents"
  | "playbooks"
  | "files"
  | "cron"
  | "company"
  | "integrations"
  | "settings";

interface NavItem {
  id: NavSection;
  labelKey: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "chat", labelKey: "nav.chat", icon: MessageSquare },
  { id: "subagents", labelKey: "nav.subagents", icon: Bot },
  { id: "playbooks", labelKey: "nav.playbooks", icon: BookOpen },
  { id: "files", labelKey: "nav.files", icon: FolderOpen },
  { id: "cron", labelKey: "nav.cron", icon: Clock },
  { id: "company", labelKey: "nav.company", icon: Building2 },
  { id: "integrations", labelKey: "nav.integrations", icon: Puzzle },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: "settings", labelKey: "nav.settings", icon: Settings },
];

interface NavSidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onCollapse: () => void;
}

export function NavSidebar({
  activeSection,
  onNavigate,
  theme,
  onToggleTheme,
  onCollapse,
}: NavSidebarProps) {
  const { t } = useTranslation();

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-full w-14 flex-col items-center border-r border-sidebar-border/70 bg-sidebar py-2">
        {/* Collapse button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCollapse}
              className="mb-2 h-8 w-8 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {t("sidebar.collapse")}
          </TooltipContent>
        </Tooltip>

        {/* Main nav */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "h-9 w-9 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] transition-transform duration-200",
                        isActive && "scale-110",
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {t(item.labelKey)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-1">
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "h-9 w-9 rounded-lg",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {t(item.labelKey)}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                {theme === "dark" ? (
                  <Sun className="h-[18px] w-[18px]" />
                ) : (
                  <Moon className="h-[18px] w-[18px]" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {t("sidebar.toggleTheme")}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
