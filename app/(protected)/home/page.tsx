import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Dumbbell, Utensils, MessageSquare, Search } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import MealLogCard from './meal-log-card';
import { toggleWorkoutCompletion, updateWorkoutFeedback } from '@/app/lib/actions/workout';
import { ensureDailyAssignment } from '@/app/lib/actions/nutrition';

export default async function ClientHome() {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT' || !session.user.name) {
        redirect('/login');
    }

    // Get client profile and username via Prisma Client
    const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true, code: true, coachId: true }
    });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true }
    });
    const dbUsername = user?.username;

    if (!clientProfile) {
        return <div className="p-8">Profile not found. Please contact support.</div>;
    }

    // Get today's workout
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysAssignment = await prisma.workoutAssignment.findFirst({
        where: {
            clientId: clientProfile.id,
            date: {
                gte: today,
                lt: tomorrow
            }
        },
        include: { workout: true }
    });

    // Get or Create Meal Assignment for today
    const dateStr = today.toISOString();
    const assignmentResult = await ensureDailyAssignment(clientProfile.id, dateStr);
    const mealAssignmentId = typeof assignmentResult === 'string' ? assignmentResult : null;

    let completedMeals: string[] = [];
    let dailyLog = "";
    let displayTitle = "Daily Nutrition";
    let planMeals = [];

    if (mealAssignmentId) {
        const assignment = await prisma.mealAssignment.findUnique({
            where: { id: mealAssignmentId },
            include: { mealPlan: true }
        });
        if (assignment) {
            dailyLog = assignment.customContent || "";
            displayTitle = assignment.mealPlan?.title || "Daily Nutrition";

            try {
                completedMeals = assignment.completedMeals ? JSON.parse(assignment.completedMeals) : [];
            } catch (e) { completedMeals = []; }

            try {
                if (assignment.mealPlan?.content) {
                    const parsed = JSON.parse(assignment.mealPlan.content);
                    planMeals = parsed.meals || [];
                }
            } catch (e) { planMeals = []; }
        }
    }


    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100 tracking-tight">Welcome back, {session.user.name.split(' ')[0]}!</h1>
                    <p className="text-gray-500 dark:text-zinc-400 dark:text-zinc-400 font-medium mt-1 text-lg">Here is your training focus for today.</p>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 dark:bg-zinc-800 px-6 py-4 rounded-3xl text-white shadow-xl shadow-zinc-200 dark:shadow-none">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Your Athlete ID</p>
                        <div className="flex items-center gap-3">
                            {/* @ts-ignore */}
                            <span className="font-bold text-sm tracking-tight">{dbUsername || session.user.username || '---'}</span>
                            <div className="h-1 w-1 rounded-full bg-zinc-700 dark:bg-zinc-600" />
                            {/* @ts-ignore */}
                            <span className="font-black text-orange-500 tracking-widest">{clientProfile?.code || '---'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {!clientProfile.coachId && (
                <Card className="rounded-[40px] border-orange-100 dark:border-orange-900/30 bg-orange-50/30 dark:bg-orange-900/10 overflow-hidden border-2 border-dashed">
                    <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-orange-900 dark:text-orange-400">Not linked with a coach?</h3>
                            <p className="text-orange-800/70 dark:text-orange-400/60 font-medium">Ask your coach for their **unique code** or **username** to unlock your customized plans.</p>
                        </div>
                        <Link href="/home/add-coach">
                            <Button className="bg-orange-600 hover:bg-orange-700 text-white h-14 px-8 rounded-2xl font-black shadow-lg shadow-orange-200 dark:shadow-none transition-all hover:scale-[1.02]">
                                Find My Coach
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className={todaysAssignment?.completed ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Dumbbell className="h-5 w-5" /> Today's Workout
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {todaysAssignment ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold">{todaysAssignment.workout.title}</h3>
                                    <p className="text-gray-500 dark:text-zinc-400">{todaysAssignment.workout.description}</p>
                                </div>

                                {/* Exercise List (Simple View) */}
                                <div className="space-y-2">
                                    {JSON.parse(todaysAssignment.workout.exercises || '[]').map((ex: any, i: number) => (
                                        <div key={i} className="flex justify-between text-sm border-b pb-2 last:border-0">
                                            <span className="font-medium">{ex.name}</span>
                                            <span className="text-gray-500 dark:text-zinc-400">{ex.sets} x {ex.reps} @ {ex.weight}</span>
                                        </div>
                                    ))}
                                </div>

                                {todaysAssignment.completed ? (
                                    <div className="bg-green-100/50 p-4 rounded-xl border border-green-100">
                                        <p className="text-sm font-bold text-green-800 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Nice work! Session finished.
                                        </p>
                                        {todaysAssignment.feedback && (
                                            <p className="text-xs text-green-700 mt-2 italic">
                                                Your feedback: "{todaysAssignment.feedback}"
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <form action={async (formData: FormData) => {
                                        'use server'
                                        if (!todaysAssignment) return;
                                        const feedback = formData.get('feedback') as string;
                                        await updateWorkoutFeedback(todaysAssignment.id, feedback);
                                        await toggleWorkoutCompletion(todaysAssignment.id, true);
                                    }} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="feedback" className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <MessageSquare className="h-3 w-3" /> Post-workout Feedback
                                            </Label>
                                            <Textarea
                                                id="feedback"
                                                name="feedback"
                                                placeholder="How did the session feel? Any pain or personal bests?"
                                                className="min-h-[80px] rounded-xl border-zinc-200 text-sm"
                                            />
                                        </div>
                                        <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold">
                                            Log as Complete
                                        </Button>
                                    </form>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-zinc-400">No workout assigned for today. Enjoy your rest day!</p>
                        )}
                    </CardContent>
                </Card>

                <MealLogCard
                    assignmentId={mealAssignmentId ?? ""}
                    initialCompleted={completedMeals}
                    initialLog={dailyLog}
                    planTitle={displayTitle}
                    planMeals={planMeals}
                />
            </div>
        </div>
    );
}
