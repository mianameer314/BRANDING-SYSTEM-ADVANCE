import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Briefcase,
  Lightbulb,
  Trophy,
  ChevronRight,
  Webhook,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/utils/utils';
import type { Permission } from '@/types/permissions';
import Logo from '@/assets/logo.svg';

type NavItem = {
  to: string;
  icon: any;
  label: string;
  permission?: Permission;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: 'Content',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/blogs', icon: FileText, label: 'Blogs', permission: 'read_content' },
      { to: '/news', icon: Newspaper, label: 'News', permission: 'read_content' },
      { to: '/projects', icon: Briefcase, label: 'Projects', permission: 'read_content' },
      { to: '/insights', icon: Lightbulb, label: 'Insights', permission: 'read_content' },
      { to: '/case-studies', icon: Trophy, label: 'Case Studies', permission: 'read_content' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/webhooks', icon: Webhook, label: 'Webhooks', permission: 'manage_webhooks' },
    ],
  },
];

export function Sidebar() {
  const { user } = useAuth();

  const userPermissions = user?.permissions ?? [];

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permission) return true;
        return userPermissions.includes(item.permission);
      }),
    }))
    .filter((section) => section.items.length > 0);


  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-border bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-primary/20 bg-primary px-6">
        <img src={Logo} alt="O2Geeks Logo" className="h-7 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {filteredSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 px-4 py-2 text-sm font-semibold transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 h-6 w-1 rounded-r bg-primary-foreground" />
                      )}
                      <Icon size={16} />
                      <span className="font-semibold">{item.label}</span>
                      {isActive && (
                        <ChevronRight size={12} className="ml-auto opacity-60" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
