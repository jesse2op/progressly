import { SidebarContent } from './sidebar-content';

interface SidebarProps {
    role: string;
    userName: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
    return (
        <div className="hidden md:flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 w-64 min-w-[256px]">
            <SidebarContent role={role} userName={userName} />
        </div>
    );
}
