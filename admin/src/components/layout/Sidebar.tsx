import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Briefcase,
  Lightbulb,
  Trophy,
  ChevronRight,
  Webhook,
  Workflow,
  GitBranch,
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
  variants?: any;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const dashboardVariants = {
  idle: { scale: 1, rotateY: 0, color: "currentColor", transition: { duration: 0.3 } },
  hover: { scale: 1.15, rotateY: 0, color: "#8b5cf6", transition: { duration: 0.2 } },
  active: { scale: 1.1, rotateY: 360, color: "currentColor", transition: { rotateY: { repeat: Infinity, duration: 3, ease: "linear" } } }
};

const blogsVariants = {
  idle: { scale: 1, y: 0, color: "currentColor", transition: { duration: 0.3 } },
  hover: { scale: 1.15, y: -2, color: "#14b8a6", transition: { duration: 0.2 } },
  active: { scale: 1.1, y: [-2, 2, -2], color: "currentColor", transition: { y: { repeat: Infinity, duration: 2, ease: "easeInOut" } } }
};

const newsVariants = {
  idle: { scale: 1, x: 0, color: "currentColor", transition: { duration: 0.3 } },
  hover: { scale: 1.15, x: 2, color: "#0ea5e9", transition: { duration: 0.2 } },
  active: { scale: 1.1, x: [-1.5, 1.5, -1.5], color: "currentColor", transition: { x: { repeat: Infinity, duration: 2, ease: "easeInOut" } } }
};

const projectsVariants = {
  idle: { scale: 1, rotate: 0, color: "currentColor", transition: { duration: 0.3 } },
  hover: { scale: 1.15, rotate: -5, color: "#f43f5e", transition: { duration: 0.2 } },
  active: { scale: 1.1, rotate: [-5, 5, -5], color: "currentColor", transition: { rotate: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } } }
};

const insightsVariants = {
  idle: { scale: 1, opacity: 1, color: "currentColor", transition: { duration: 0.3 } },
  hover: { scale: 1.2, opacity: 1, color: "#eab308", transition: { duration: 0.2 } },
  active: { scale: [1, 1.1, 1], opacity: [1, 0.8, 1], color: "currentColor", transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } }
};

const trophyVariants = {
  idle: { scale: 1, color: "currentColor", transition: { duration: 0.3 } },
  hover: { scale: 1.2, color: "#f59e0b", transition: { duration: 0.2 } },
  active: { scale: [1, 1.1, 1], color: "currentColor", transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } }
};

const webhookVariants = {
  idle: { scale: 1, rotate: 0, color: "currentColor", transition: { duration: 0.3 } },
  hover: { scale: 1.15, rotate: 0, color: "#8b5cf6", transition: { duration: 0.2 } },
  active: { scale: 1.1, rotate: 360, color: "currentColor", transition: { rotate: { repeat: Infinity, duration: 2, ease: "linear" } } }
};

const navSections: NavSection[] = [
  {
    label: 'Content',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', variants: dashboardVariants },
      { to: '/blogs', icon: FileText, label: 'Blogs', permission: 'read_content', variants: blogsVariants },
      { to: '/news', icon: Newspaper, label: 'News', permission: 'read_content', variants: newsVariants },
      { to: '/projects', icon: Briefcase, label: 'Projects', permission: 'read_content', variants: projectsVariants },
      { to: '/insights', icon: Lightbulb, label: 'Insights', permission: 'read_content', variants: insightsVariants },
      { to: '/case-studies', icon: Trophy, label: 'Case Studies', permission: 'read_content', variants: trophyVariants },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/operations', icon: Workflow, label: 'Operations Console', permission: 'view_drafts', variants: dashboardVariants },
      { to: '/operations/workflow', icon: GitBranch, label: 'Content Pipeline', permission: 'view_drafts', variants: dashboardVariants },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/webhooks', icon: Webhook, label: 'Webhooks', permission: 'manage_webhooks', variants: webhookVariants },
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
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {filteredSections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className="block relative outline-none rounded-lg overflow-hidden"
                  >
                    {({ isActive }) => (
                      <motion.div
                        initial="idle"
                        whileHover={isActive ? "idle" : "hover"}
                        animate={isActive ? "active" : "idle"}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-3 text-sm font-semibold transition-colors z-10",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-zinc-50/50"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebarActiveBg"
                            className="absolute inset-0 bg-primary shadow-sm rounded-lg"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}

                        {isActive && (
                          <motion.div
                            layoutId="sidebarActiveIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-zinc-900 rounded-r-full z-20"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}

                        <motion.div
                          variants={item.variants || {
                            idle: { scale: 1, rotate: 0, color: "currentColor" },
                            hover: {
                              scale: 1.15,
                              rotate: [0, -12, 12, -12, 0],
                              color: "#10b981",
                              transition: {
                                rotate: { repeat: Infinity, duration: 0.5, ease: "linear" }
                              }
                            },
                            active: { scale: 1, rotate: 0, color: "currentColor" }
                          }}
                          className="relative z-20 flex items-center justify-center"
                        >
                          <Icon size={18} />
                        </motion.div>

                        <motion.span
                          variants={{
                            idle: { x: 0 },
                            hover: { x: 6 },
                            active: { x: 0 }
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="relative z-20"
                        >
                          {item.label}
                        </motion.span>

                        {isActive && (
                          <motion.div
                            className="relative z-20 ml-auto"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 0.8, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight size={14} />
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
