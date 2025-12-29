'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    Utensils,
    MessageSquare,
    TrendingUp,
    Home,
} from 'lucide-react';
import { LogoutButton } from './logout-button';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';

interface SidebarContentProps {
    role: string;
    userName: string;
    onLinkClick?: () => void;
}

export function SidebarContent({ role, userName, onLinkClick }: SidebarContentProps) {
    const pathname = usePathname();

    const coachLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/clients', label: 'Clients', icon: Users },
        { href: '/dashboard/workouts', label: 'Workouts', icon: Dumbbell },
        { href: '/dashboard/meal-plans', label: 'Meal Plans', icon: Utensils },
        { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    ];

    const clientLinks = [
        { href: '/home', label: 'Home', icon: Home },
        { href: '/progress', label: 'My Progress', icon: TrendingUp },
        { href: '/workouts', label: 'Workouts', icon: Dumbbell },
        { href: '/messages', label: 'Coach Chat', icon: MessageSquare },
    ];

    const links = role === 'COACH' ? coachLinks : clientLinks;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 w-full">
            <div className="p-6">
                <Link href={role === 'COACH' ? '/dashboard' : '/home'} onClick={onLinkClick}>
                    <h2 className="text-2xl font-bold text-blue-600 cursor-pointer">Progressly</h2>
                </Link>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                    {role} PORTAL
                </p>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onLinkClick}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                isActive
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-zinc-100"
                            )}
                        >
                            <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-400 dark:text-zinc-500")} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">Account Settings</p>
                    </div>
                    <ThemeToggle />
                </div>
                <LogoutButton />
            </div>
        </div>
    );
}
