import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Activity, Code, Cpu, FileText } from "lucide-react";

const links = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/code", label: "ESP32 Code", icon: Code },
  { to: "/hardware", label: "Hardware", icon: Cpu },
  { to: "/docs", label: "Documentation", icon: FileText },
];

export function NavBar() {
  const { pathname } = useLocation();

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center glow-primary">
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-sm tracking-tight">
            PestGuard<span className="text-primary">ESP32</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all",
                pathname === to
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
