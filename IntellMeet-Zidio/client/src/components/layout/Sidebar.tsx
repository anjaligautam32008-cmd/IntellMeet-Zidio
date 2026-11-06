import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Kanban,
  BarChart3,
  Users,
  Settings,
  CalendarDays,
  FileCheck2
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Meetings', href: '/meetings', icon: Video },
  { name: 'Action Items', href: '/action-items', icon: FileCheck2 },
  { name: 'Kanban Board', href: '/tasks', icon: Kanban },
  { name: 'Team Workspace', href: '/workspaces', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Settings', href: '/settings', icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="flex-1 py-4 px-3 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Enterprise Menu
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Production / Demo Banner Info */}
      <div className="p-3 m-3 rounded-lg border border-border bg-muted/60 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1.5 font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>WebRTC & AI Online</span>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed">
          OpenAI Whisper & GPT summary engine ready. Demo fallback enabled for zero-friction local testing.
        </p>
      </div>
    </aside>
  );
}
