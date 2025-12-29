import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Dumbbell, MessageSquare, History, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toggleWorkoutCompletion, updateWorkoutFeedback } from '@/app/lib/actions/workout';

export default async function ClientWorkoutsPage() {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT') {
        redirect('/login');
    }

    const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
        include: {
            workoutAssignments: {
                include: { workout: true },
                orderBy: { date: 'desc' }
            }
        }
    });

    if (!clientProfile) {
        return <div className="p-8 text-center text-zinc-500">Profile not found.</div>;
    }

    const assignments = clientProfile.workoutAssignments;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-10 min-h-screen pb-24">
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600/10 p-2 rounded-xl">
                        <Dumbbell className="h-6 w-6 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100 tracking-tight">Training Log</h1>
                </div>
                <p className="text-gray-500 dark:text-zinc-400 dark:text-zinc-400 font-medium">Track your sessions and view your progress history.</p>
            </header>

            {assignments.length === 0 ? (
                <Card className="rounded-[40px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 py-20">
                    <CardContent className="flex flex-col items-center text-center space-y-4">
                        <History className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100">No Workouts Assigned</h3>
                            <p className="text-gray-500 dark:text-zinc-400 dark:text-zinc-500 font-medium max-w-xs mx-auto">
                                Once your coach assigns workouts, they will appear here for you to track.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {assignments.map((assignment) => (
                        <Card key={assignment.id} className={`rounded-[32px] overflow-hidden transition-all border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xl dark:shadow-none hover:shadow-2xl dark:hover:bg-zinc-900 transition-all ${assignment.completed ? 'border-l-4 border-l-green-500' : ''}`}>
                            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 py-6 px-8 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100">{assignment.workout.title}</CardTitle>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(assignment.date), 'EEEE, MMMM d')}
                                        </div>
                                        {assignment.completed && (
                                            <div className="flex items-center gap-1.5 text-xs font-black text-green-600 dark:text-green-500 uppercase tracking-widest bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Session Goal</h4>
                                            <p className="text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">
                                                {assignment.workout.description || 'No description provided.'}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Exercise Breakdown</h4>
                                            <div className="space-y-3">
                                                {JSON.parse(assignment.workout.exercises || '[]').map((ex: any, i: number) => (
                                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800 transition-colors">
                                                        <div className="space-y-0.5">
                                                            <p className="font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100">{ex.name}</p>
                                                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Target Effort</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100">{ex.sets} x {ex.reps}</p>
                                                            <p className="text-xs font-bold text-gray-500 dark:text-zinc-400 dark:text-zinc-500">{ex.weight} {ex.unit || 'kg'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-zinc-50 dark:bg-zinc-950/30 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800/50 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <h4 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Athlete Notes</h4>
                                            </div>

                                            {assignment.completed ? (
                                                <div className="space-y-4">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-zinc-300 italic bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                                        "{assignment.feedback || 'No feedback logged.'}"
                                                    </p>
                                                    <form action={toggleWorkoutCompletion.bind(null, assignment.id, false)}>
                                                        <Button variant="ghost" className="w-full text-zinc-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-black uppercase tracking-widest h-12 rounded-xl transition-all">
                                                            Reset Session Status
                                                        </Button>
                                                    </form>
                                                </div>
                                            ) : (
                                                <form action={async (formData) => {
                                                    'use server'
                                                    const feedback = formData.get('feedback') as string;
                                                    await updateWorkoutFeedback(assignment.id, feedback);
                                                    await toggleWorkoutCompletion(assignment.id, true);
                                                }} className="space-y-4">
                                                    <Textarea
                                                        name="feedback"
                                                        placeholder="How did this feel? Any sets particularly heavy?"
                                                        className="min-h-[120px] rounded-[20px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-inner focus-visible:ring-blue-600 px-5 pt-4 transition-all"
                                                    />
                                                    <Button className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-black text-lg transition-all active:scale-[0.98]">
                                                        Complete Workout
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
