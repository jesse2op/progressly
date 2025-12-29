import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Dumbbell, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deleteWorkout } from '@/app/lib/actions/workout';

export default async function WorkoutsPage() {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') redirect('/login');

    const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!coachProfile) {
        return <div>Coach profile not found. Please contact support.</div>;
    }

    const workouts = await prisma.workout.findMany({
        where: { coachId: coachProfile.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 dark:text-zinc-100">Workout Templates</h1>
                    <p className="text-gray-500 dark:text-zinc-400 dark:text-zinc-400 mt-1">Design and organize your client programs.</p>
                </div>
                <Link href="/dashboard/workouts/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-all h-11 px-6">
                        <Plus className="mr-2 h-5 w-5" /> Create Template
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workouts.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                            <Dumbbell className="h-10 w-10 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 dark:text-zinc-100">No workout templates yet</h3>
                        <p className="mt-2 text-gray-500 dark:text-zinc-400 dark:text-zinc-400 text-center max-w-sm px-4">
                            Start creating templates to quickly assign balanced programs to your clients.
                        </p>
                        <Link href="/dashboard/workouts/create" className="mt-8">
                            <Button variant="outline" className="rounded-xl px-8 h-12 dark:hover:bg-zinc-800">
                                Create Your First Template
                            </Button>
                        </Link>
                    </div>
                ) : (
                    workouts.map((workout) => (
                        <Card key={workout.id} className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col h-full bg-white dark:bg-zinc-900/50">
                            <CardHeader className="p-0">
                                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />
                                <div className="p-6 pb-4">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                            <Dumbbell className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-zinc-100 dark:text-zinc-100 leading-tight">
                                                {workout.title}
                                            </CardTitle>
                                            <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 mt-0.5">
                                                Added {new Date(workout.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 pt-0 flex-1 flex flex-col">
                                <p className="text-sm text-gray-600 dark:text-zinc-400 flex-1 line-clamp-3">
                                    {workout.description || 'No description provided for this workout template.'}
                                </p>

                                <div className="mt-6 flex items-center gap-2">
                                    <Link href={`/dashboard/workouts/${workout.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full justify-center rounded-xl bg-gray-50/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border-zinc-100 dark:border-zinc-800 h-10 font-medium">
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </Button>
                                    </Link>

                                    <form action={async () => {
                                        'use server'
                                        try {
                                            await deleteWorkout(workout.id)
                                        } catch (e) {
                                            console.error(e)
                                        }
                                    }}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
