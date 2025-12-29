import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { sendMessage } from '@/app/lib/actions/message';

export default async function ClientMessagesPage() {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT') redirect('/login');

    const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
        include: { coach: { include: { user: true } } }
    });

    if (!clientProfile || !clientProfile.coach) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-full mb-4">
                    <UserIcon className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">No Coach Assigned</h2>
                <p className="text-gray-500 dark:text-zinc-400 mt-2 max-w-sm">
                    You don't have an active coach yet. Once your coach invites you, you'll be able to chat with them here.
                </p>
            </div>
        );
    }

    const coach = clientProfile.coach.user;

    // Fetch messages between client and coach
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: session.user.id, receiverId: coach.id },
                { senderId: coach.id, receiverId: session.user.id },
            ]
        },
        orderBy: { createdAt: 'asc' },
    });

    return (
        <div className="p-4 md:p-8 h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] max-h-screen flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight dark:text-zinc-100">Coach Chat</h1>
                    <p className="text-gray-500 dark:text-zinc-400 flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Chatting with Coach {coach.name}
                    </p>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden rounded-[32px] border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-none bg-white dark:bg-zinc-900/50">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 py-5 px-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 h-12 w-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200 dark:shadow-none">
                            {coach.name?.[0]}
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black text-gray-900 dark:text-zinc-100 leading-none mb-1">{coach.name}</CardTitle>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">{coach.email}</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/30 dark:bg-zinc-950/40">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                            <p className="italic">No messages yet. Say hello to your coach!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === session.user.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] md:max-w-[70%] rounded-[24px] px-5 py-3.5 shadow-sm transition-all ${isMe
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-700 shadow-xl dark:shadow-none rounded-tl-none'
                                        }`}>
                                        <p className="text-sm leading-relaxed antialiased font-medium">{msg.content}</p>
                                        <p className={`text-[10px] mt-2 font-black uppercase tracking-widest opacity-40 ${isMe ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>

                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <form
                        action={async (formData) => {
                            'use server';
                            await sendMessage(null, formData);
                        }}
                        className="flex gap-4"
                    >
                        <input type="hidden" name="receiverId" value={coach.id} />
                        <Input
                            name="content"
                            placeholder="Type a message..."
                            className="flex-1 rounded-[20px] border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 dark:text-zinc-100 focus-visible:ring-blue-600 h-14 px-6 transition-all"
                            autoComplete="off"
                            required
                        />
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-[20px] w-14 h-14 p-0 shrink-0 shadow-xl shadow-blue-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
                            <Send className="h-6 w-6" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
