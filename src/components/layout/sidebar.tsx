'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PenTool,
  FileText,
  Grid3X3,
  BookOpen,
  Settings,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate', icon: PenTool },
  { href: '/articles', label: 'Articles', icon: FileText },
  { href: '/refresh', label: 'Refresh Queue', icon: RefreshCcw },
  { href: '/matrix', label: 'Content Matrix', icon: Grid3X3 },
  { href: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r bg-sidebar lg:block">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="text-sm font-semibold text-sidebar-foreground">
          SoCal Content Engine
        </Link>
      </div>
      <nav className="space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
