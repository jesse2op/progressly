import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Dumbbell, Clock, Target } from 'lucide-react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';

export default async function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== 'COACH') redirect('/login');

    const workout = await prisma.workout.findUnique({
        where: { id: id }
    });

    if (!workout) {
        notFound();
    }

    const exercises = JSON.parse(workout.exercises || '[]');

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="space-y-4">
                <Link href="/dashboard/workouts">
                    <Button variant="ghost" size="sm" className="text-gray-500 dark:text-zinc-400 dark:text-zinc-400 hover:text-gray-900 dark:text-zinc-100 dark:hover:text-zinc-100 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
                    </Button>
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">{workout.title}</h1>
                        <p className="text-lg text-gray-500 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                            {workout.description || 'No description provided for this workout template.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Exercise List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-3">
                            <Dumbbell className="h-6 w-6 text-blue-600" />
                            Exercises
                            <span className="text-sm font-medium text-gray-400 ml-2">
                                {exercises.length} Total
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {exercises.length === 0 ? (
                            <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center bg-gray-50/50">
                                <p className="text-gray-400 italic">No exercises added to this template.</p>
                            </Card>
                        ) : (
                            exercises.map((exercise: any, index: number) => (
                                <Card key={exercise.id || index} className="overflow-hidden border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-stretch h-full">
                                        <div className="w-1.5 bg-blue-600" />
                                        <CardContent className="flex-1 p-5">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{exercise.name}</h3>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Sets</p>
                                                        <p className="text-lg font-black text-blue-600 dark:text-blue-400">{exercise.sets}</p>
                                                    </div>
                                                    <div className="h-8 w-px bg-gray-100 dark:bg-zinc-800" />
                                                    <div className="text-center">
                                                        <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Reps</p>
                                                        <p className="text-lg font-black text-blue-600 dark:text-blue-400">{exercise.reps}</p>
                                                    </div>
                                                    <div className="h-8 w-px bg-gray-100" />
                                                    <div className="text-center min-w-[60px]">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Weight</p>
                                                        <p className="text-lg font-black text-gray-900 dark:text-zinc-100">{exercise.weight || '—'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Stats/Info */}
                <div className="space-y-6">
                    <Card className="rounded-2xl border-zinc-200 bg-zinc-50/30">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-gray-400">Template Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm font-medium">Created On</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                                    {new Date(workout.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Target className="h-4 w-4" />
                                    <span className="text-sm font-medium">Focus</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">General</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Link href={`/dashboard/clients`} className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl shadow-md">
                            Assign to Client
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
