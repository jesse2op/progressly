import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { MessageSquare, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function CoachMessagesPage() {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') redirect('/login');

    const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!coachProfile) {
        return <div className="p-8">Coach profile not found.</div>;
    }

    // Fetch all clients for this coach and their last message
    const clients = await prisma.clientProfile.findMany({
        where: { coachId: coachProfile.id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    receivedMessages: {
                        where: { senderId: session.user.id },
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    },
                    sentMessages: {
                        where: { receiverId: session.user.id },
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    const conversations = clients.map(client => {
        const lastSent = client.user.sentMessages[0];
        const lastReceived = client.user.receivedMessages[0];
        const lastMessage = [lastSent, lastReceived]
            .filter(Boolean)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

        return {
            clientId: client.user.id,
            name: client.user.name,
            email: client.user.email,
            lastMessage: lastMessage?.content || 'No messages yet',
            lastMessageDate: lastMessage?.createdAt,
            unread: lastSent && !lastSent.read
        };
    }).sort((a, b) => {
        if (!a.lastMessageDate) return 1;
        if (!b.lastMessageDate) return -1;
        return b.lastMessageDate.getTime() - a.lastMessageDate.getTime();
    });

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-zinc-100">Messages</h1>
                    <p className="text-gray-500 dark:text-zinc-500 mt-1 font-medium">Chat with your clients and track conversations.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
                    <Input placeholder="Search conversations..." className="pl-10 h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 dark:text-zinc-100" />
                </div>
            </div>

            <div className="space-y-4">
                {conversations.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-gray-100 dark:border-zinc-800">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-200 dark:text-zinc-700" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-zinc-100">No conversations yet</h3>
                        <p className="mt-1 text-gray-500 dark:text-zinc-400">Invite clients to start messaging.</p>
                    </div>
                ) : (
                    conversations.map((convo) => (
                        <Link key={convo.clientId} href={`/dashboard/messages/${convo.clientId}`}>
                            <Card className="hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md transition-all rounded-2xl border-zinc-200 dark:border-zinc-800 cursor-pointer overflow-hidden mb-4 group bg-white dark:bg-zinc-900/50 shadow-sm dark:shadow-none">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="relative">
                                            <div className="bg-blue-600 h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                {convo.name?.[0]}
                                            </div>
                                            {convo.unread && (
                                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 border-2 border-white rounded-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-zinc-100 truncate">{convo.name}</h3>
                                                {convo.unread && (
                                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                                                )}
                                            </div>
                                            <p className={`text-sm line-clamp-1 ${convo.unread ? 'text-gray-900 dark:text-zinc-100 font-semibold' : 'text-gray-500 dark:text-zinc-400'}`}>
                                                {convo.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-xs font-bold text-gray-400">
                                            {convo.lastMessageDate ? new Date(convo.lastMessageDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                                        </p>
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
