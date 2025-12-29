import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { revalidatePath } from 'next/cache';
import { TrendingUp, History, Scale, PencilLine } from 'lucide-react';

export default async function ProgressPage() {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT') {
        redirect('/login');
    }

    const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!clientProfile) return <div className="p-8">Profile not found</div>;

    const logs = await prisma.progressLog.findMany({
        where: { clientId: clientProfile.id },
        orderBy: { date: 'desc' }
    });

    async function logProgress(formData: FormData) {
        'use server'
        const weight = parseFloat(formData.get('weight') as string);
        const notes = formData.get('notes') as string;

        if (isNaN(weight)) return;

        await prisma.progressLog.create({
            data: {
                clientId: clientProfile!.id,
                weight,
                notes,
                date: new Date(),
            }
        });
        revalidatePath('/progress');
    }

    const lastWeight = logs[0]?.weight || '--';

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-zinc-100 dark:text-zinc-100">Track Progress</h1>
                    <p className="text-gray-500 dark:text-zinc-400 dark:text-zinc-400 mt-1 font-medium">Keep track of your journey and share updates with your coach.</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-3 flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Last Weight</p>
                        <p className="text-xl font-black text-blue-900">{lastWeight} <span className="text-sm font-medium">lbs</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Log Form */}
                <div className="lg:col-span-5">
                    <Card className="rounded-3xl border-zinc-200 shadow-xl overflow-hidden sticky top-8">
                        <div className="h-1.5 bg-blue-600 w-full" />
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Scale className="h-5 w-5 text-blue-600" />
                                Today's Entry
                            </CardTitle>
                            <CardDescription>Record your stats for {new Date().toLocaleDateString()}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={logProgress} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="weight" className="text-sm font-bold text-gray-700">Weight (lbs/kg)</Label>
                                    <div className="relative">
                                        <Input
                                            id="weight"
                                            name="weight"
                                            type="number"
                                            step="0.1"
                                            required
                                            placeholder="000.0"
                                            className="h-14 text-2xl font-black pl-4 pr-12 rounded-2xl border-zinc-200 focus-visible:ring-blue-600"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">lbs</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-bold text-gray-700">Notes / How do you feel?</Label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        placeholder="Energy levels, sleep, cravings, or any non-scale victories..."
                                        className="min-h-[120px] rounded-2xl border-zinc-200 focus-visible:ring-blue-600 p-4 resize-none"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
                                    Save Progress Log
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* History */}
                <div className="lg:col-span-7 space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                        <History className="h-5 w-5 text-gray-400" />
                        Progress History
                    </h2>

                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-zinc-100">
                                <Scale className="mx-auto h-12 w-12 text-zinc-100 mb-4" />
                                <p className="text-gray-400 font-medium">No logs recorded yet.</p>
                            </div>
                        ) : (
                            logs.map(log => (
                                <Card key={log.id} className="rounded-2xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm hover:shadow-md dark:shadow-none group">
                                    <CardContent className="p-5">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                                            <div className="flex items-start gap-5">
                                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[90px] group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 transition-colors">
                                                    <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest text-center">Weight</p>
                                                    <p className="text-2xl font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100 text-center leading-none mt-1.5">{log.weight}</p>
                                                </div>
                                                <div className="pt-1">
                                                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5">
                                                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                                    </p>
                                                    {log.notes ? (
                                                        <div className="flex gap-3">
                                                            <PencilLine className="h-4 w-4 text-zinc-300 dark:text-zinc-700 mt-0.5 shrink-0" />
                                                            <p className="text-sm text-gray-600 dark:text-zinc-400 italic leading-relaxed">"{log.notes}"</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] text-zinc-300 dark:text-zinc-700 font-bold uppercase tracking-widest mt-1">No notes added</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
