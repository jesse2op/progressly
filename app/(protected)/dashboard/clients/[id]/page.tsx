import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Dumbbell, Utensils, Scale, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AssignWorkoutDialog } from './assign-workout-dialog';

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== 'COACH') redirect('/login');

    const client = await prisma.clientProfile.findUnique({
        where: { id: id },
        include: {
            user: true,
            workoutAssignments: {
                include: { workout: true },
                orderBy: { date: 'desc' },
                take: 10
            },
            progressLogs: {
                orderBy: { date: 'desc' },
                take: 5
            }
        },
    });

    if (!client) {
        return <div>Client not found</div>;
    }

    // Fetch coach's workouts for the assignment dialog
    const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id }
    });

    const coachWorkouts = coachProfile ? await prisma.workout.findMany({
        where: { coachId: coachProfile.id }
    }) : [];


    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/clients">
                    <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-zinc-800">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-black tracking-tight dark:text-zinc-100">{client.user.name}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info and Assignments */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Client Info */}
                    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm bg-white dark:bg-zinc-900/50">
                        <div className="h-1 bg-blue-600 w-full" />
                        <CardHeader>
                            <CardTitle className="text-xl font-bold dark:text-zinc-100">Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                                <span className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Email</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{client.user.email}</span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Status</span>
                                <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-green-500" /> Active
                                </span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Joined</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                                    {new Date(client.user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Summary */}
                    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                                    <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Last Weight</p>
                                    <p className="text-2xl font-black text-gray-900 dark:text-zinc-100">
                                        {client.progressLogs[0]?.weight || '--'} <span className="text-sm font-medium">lbs</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Messaging Quick Action */}
                    <Link href={`/dashboard/messages/${id}`}>
                        <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-50">
                            Open Chat
                        </Button>
                    </Link>
                </div>

                {/* Right Column: Detailed History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Workout Timeline */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <Dumbbell className="h-6 w-6 text-blue-600" />
                                Workout History
                            </h2>
                            <AssignWorkoutDialog clientId={client.id} workouts={coachWorkouts} />
                        </div>

                        <div className="space-y-3">
                            {client.workoutAssignments.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No workouts assigned yet.</p>
                            ) : (
                                client.workoutAssignments.map((assignment) => (
                                    <Card key={assignment.id} className="rounded-xl border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${assignment.completed ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-gray-50 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500'}`}>
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-zinc-100">{assignment.workout.title}</p>
                                                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
                                                        Scheduled for {new Date(assignment.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {assignment.completed && (
                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">Completed</span>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Progress History */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Scale className="h-6 w-6 text-orange-600" />
                            Progress Logs
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {client.progressLogs.length === 0 ? (
                                <p className="text-sm text-gray-400 italic col-span-full">No progress logs recorded.</p>
                            ) : (
                                client.progressLogs.map((log) => (
                                    <Card key={log.id} className="rounded-xl border-zinc-100 dark:border-zinc-800 bg-orange-50/20 dark:bg-orange-900/10">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-lg font-black text-gray-900 dark:text-zinc-100">{log.weight} lbs</span>
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase">
                                                    {new Date(log.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {log.notes && (
                                                <p className="text-xs text-gray-600 dark:text-zinc-400 italic line-clamp-2 mt-2 leading-relaxed">
                                                    "{log.notes}"
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
