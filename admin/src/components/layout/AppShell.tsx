import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, string> = {
 '/dashboard': 'Dashboard',
 '/blogs': 'Blogs',
 '/news': 'News',
 '/projects': 'Projects',
 '/insights': 'Insights',
 '/case-studies': 'Case Studies',
 '/users': 'Users',
 '/settings': 'Settings',
};

export function AppShell() {
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const location = useLocation();
 const title = pageTitles[location.pathname] ?? 'O2Geeks CMS';

 return (
 <div className="flex h-screen overflow-hidden bg-background">
 {/* Sidebar — desktop: always visible, mobile: hidden */}
 <div className="hidden lg:flex lg:h-full">
 <Sidebar />
 </div>

 {/* Mobile sidebar overlay */}
 {sidebarOpen && (
 <div className="fixed inset-0 z-40 lg:hidden">
 <div
 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
 onClick={() => setSidebarOpen(false)}
 />
 <div className="absolute left-0 top-0 h-full">
 <Sidebar />
 </div>
 </div>
 )}

 {/* Main content */}
 <div className="flex flex-1 flex-col overflow-hidden">
 <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
 <main className="flex-1 overflow-y-auto p-6 bg-accent/30 relative">
     <div 
        key={location.pathname} 
        className="animate-page-transition h-full"
     >
        <Outlet />
     </div>
 </main>
 </div>
 </div>
 );
}
