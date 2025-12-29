import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, User } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ClientsPage() {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') redirect('/login');

    const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!coachProfile) redirect('/dashboard');

    const clients = await prisma.clientProfile.findMany({
        where: { coachId: coachProfile.id },
        include: { user: true },
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100 tracking-tight">Clients</h1>
                    <p className="text-gray-500 dark:text-zinc-400 dark:text-zinc-400 font-medium">Manage and monitor your athlete roster</p>
                </div>
                <Link href="/dashboard/clients/add">
                    <Button className="bg-zinc-900 dark:bg-blue-600 hover:bg-zinc-800 dark:hover:bg-blue-700 text-white dark:text-white h-12 px-6 rounded-2xl font-bold shadow-xl shadow-zinc-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Plus className="mr-2 h-5 w-5" /> Add New Client
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clients.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-zinc-50 dark:bg-zinc-900/30 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-sm mb-4">
                            <User className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100 dark:text-zinc-100">No clients yet</h3>
                        <p className="text-gray-500 dark:text-zinc-400 dark:text-zinc-400 mt-2 text-center max-w-xs">
                            Start building your professional roster by inviting your first client today.
                        </p>
                        <Link href="/dashboard/clients/add" className="mt-6">
                            <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800 font-bold dark:hover:bg-zinc-800">
                                Send an Invitation
                            </Button>
                        </Link>
                    </div>
                ) : (
                    clients.map((client) => (
                        <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                            <Card className="rounded-[32px] border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300 cursor-pointer group bg-white dark:bg-zinc-900/50 overflow-hidden">
                                <CardHeader className="flex flex-row items-center gap-5 pb-6">
                                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 transition-colors">
                                        <User className="h-7 w-7 text-zinc-600 dark:text-zinc-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-xl font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100 leading-none">
                                            {client.user.name}
                                        </CardTitle>
                                        <p className="text-sm font-bold text-gray-400 dark:text-zinc-500">
                                            {client.user.email}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-400 dark:text-zinc-500">Active</span>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-700">
                                            View Profile →
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
