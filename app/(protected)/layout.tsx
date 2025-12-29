import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { MobileNav } from '@/components/mobile-nav'

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 overflow-hidden">
            <Sidebar
                role={session.user.role}
                userName={session.user.name || 'User'}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="md:hidden flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <MobileNav
                        role={session.user.role}
                        userName={session.user.name || 'User'}
                    />
                    <span className="font-bold text-lg text-blue-600">Progressly</span>
                </div>
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
