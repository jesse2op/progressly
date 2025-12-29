import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Users, ClipboardList, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CoachDashboard() {
    const session = await auth();

    if (!session || session.user.role !== 'COACH') {
        redirect('/login');
    }

    // Get coach profile and username via Prisma Client
    const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true, code: true }
    });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true }
    });
    const dbUsername = user?.username;

    if (!coachProfile) {
        return <div className="p-8">Coach profile not found. Please contact support.</div>;
    }

    // Fetch dynamic data
    const activeClientsCount = await prisma.clientProfile.count({
        where: { coachId: coachProfile.id }
    });

    const pendingCheckinsCount = await prisma.workoutAssignment.count({
        where: {
            client: { coachId: coachProfile.id },
            completed: false,
            date: { lte: new Date() }
        }
    });

    const unreadMessagesCount = await prisma.message.count({
        where: {
            receiverId: session.user.id,
            read: false
        }
    });

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-zinc-100 tracking-tight">Coach Dashboard</h1>
                    <p className="text-gray-500 dark:text-zinc-400 font-medium mt-1 text-lg">Welcome back, Coach {session.user.name}!</p>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 dark:bg-zinc-800 px-6 py-4 rounded-3xl text-white shadow-xl shadow-zinc-200 dark:shadow-none">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Your Identity</p>
                        <div className="flex items-center gap-3">
                            {/* @ts-ignore */}
                            <span className="font-bold text-sm tracking-tight">{dbUsername || session.user.username || '---'}</span>
                            <div className="h-1 w-1 rounded-full bg-zinc-700 dark:bg-zinc-600" />
                            {/* @ts-ignore */}
                            <span className="font-black text-orange-500 tracking-widest">{coachProfile?.code || '---'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium dark:text-zinc-300">Active Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground dark:text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-zinc-100">{activeClientsCount}</div>
                        <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-1">Total assigned clients</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium dark:text-zinc-300">Pending Workouts</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground dark:text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-zinc-100">{pendingCheckinsCount}</div>
                        <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-1">Due or overdue assignments</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium dark:text-zinc-300">Unread Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground dark:text-zinc-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold dark:text-zinc-100">{unreadMessagesCount}</div>
                        <p className="text-xs text-muted-foreground dark:text-zinc-500 mt-1">Awaiting your response</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
