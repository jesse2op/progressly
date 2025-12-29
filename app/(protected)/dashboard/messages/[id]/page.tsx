import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Send, ArrowLeft, MoreVertical, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { sendMessage } from '@/app/lib/actions/message';
import Link from 'next/link';

export default async function CoachClientMessagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== 'COACH') redirect('/login');

    const client = await prisma.user.findUnique({
        where: { id: id },
        include: { clientProfile: true }
    });

    if (!client || !client.clientProfile) {
        notFound();
    }

    // Fetch messages between coach and client
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: session.user.id, receiverId: client.id },
                { senderId: client.id, receiverId: session.user.id },
            ]
        },
        orderBy: { createdAt: 'asc' },
    });

    return (
        <div className="p-4 md:p-8 h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] max-h-screen flex flex-col gap-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/messages">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-black tracking-tight dark:text-zinc-100">{client.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Client Chat Area</span>
                    </div>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-900/50">
                <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 flex flex-row items-center justify-between py-4 px-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold">
                            {client.name?.[0]}
                        </div>
                        <div>
                            <CardTitle className="text-base text-gray-900 dark:text-zinc-100 leading-none mb-1">{client.name}</CardTitle>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{client.email}</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl text-gray-400">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/20 dark:bg-zinc-950/40">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500">
                            <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-full mb-4">
                                <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                            </div>
                            <p className="font-medium">No conversation history.</p>
                            <p className="text-sm">Start the conversation with your client.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === session.user.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] rounded-[24px] px-5 py-3.5 shadow-sm transition-all ${isMe
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
                        className="flex gap-3"
                    >
                        <input type="hidden" name="receiverId" value={client.id} />
                        <Input
                            name="content"
                            placeholder="Type a message or use a template..."
                            className="flex-1 rounded-2xl border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 focus-visible:ring-blue-600 h-12 px-5"
                            autoComplete="off"
                            required
                        />
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-2xl w-12 h-12 p-0 shadow-lg shadow-blue-200 transition-all hover:scale-105">
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}

// Re-using the icon from the list page
import { MessageSquare } from 'lucide-react';
