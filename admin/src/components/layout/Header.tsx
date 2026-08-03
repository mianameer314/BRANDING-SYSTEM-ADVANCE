import { useState, useRef, useEffect } from 'react';
import { Menu, User, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import DarkAsterisk from '@/assets/dark-astrisk.svg';

const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    editor: 'Editor',
    user: 'User',
};

interface HeaderProps {
    title: string;
    onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-primary/20 bg-primary px-6 shadow-sm">
            {/* Left: hamburger (mobile) + title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-1.5 text-primary-foreground hover:bg-primary-foreground/10 lg:hidden"
                    aria-label="Open navigation"
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-lg font-bold text-primary-foreground flex items-center gap-2">
                    <img src={DarkAsterisk} alt="Asterisk" className="h-5 w-5 animate-[spin_4s_linear_infinite]" />
                    {title}
                </h1>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
                <div className="relative group" ref={profileMenuRef}>
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10 p-1.5 rounded-lg transition"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground text-[11px] font-bold text-primary shadow-sm">
                            {user?.full_name
                                ? user.full_name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)
                                : '?'}
                        </div>
                        <div className="hidden sm:flex flex-col items-start text-left">
                            <span className="font-bold text-foreground leading-none mb-1">
                                {user?.full_name}
                            </span>
                            <span className="text-[10px] text-foreground/80 font-semibold leading-none">
                                {roleLabels[user?.role ?? 'user'] ?? user?.role}
                            </span>
                        </div>
                    </button>

                    <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg bg-white border border-border shadow-lg overflow-hidden py-1 transition-all duration-200 z-50 origin-top ${isProfileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-[-10px] md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0'}`}>
                        <Link
                            to="/profile"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <User size={16} />
                            Profile
                        </Link>
                        {user?.permissions?.includes('manage_users') && (
                            <Link
                                to="/users"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                            >
                                <Users size={16} />
                                Manage Users
                            </Link>
                        )}
                        <div className="border-t border-border my-1"></div>
                        <button
                            onClick={() => {
                                setIsProfileMenuOpen(false);
                                setIsLogoutModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            <LogOut size={16} />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-foreground mb-2">Heading out?</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to sign out of your account? You'll need to log back in to access the dashboard.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                            >
                                Yes, Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
