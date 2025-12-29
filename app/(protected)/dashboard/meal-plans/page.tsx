import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Utensils, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deleteMealPlan } from '@/app/lib/actions/meal-plan';

export default async function MealPlansPage() {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') redirect('/login');

    const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!coachProfile) {
        return <div className="p-8">Coach profile not found.</div>;
    }

    const mealPlans = await prisma.mealPlan.findMany({
        where: { coachId: coachProfile.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 dark:text-zinc-100">Meal Plan Templates</h1>
                    <p className="text-gray-500 dark:text-zinc-400 dark:text-zinc-400 mt-1">Create and manage nutritional guides for your clients.</p>
                </div>
                <Link href="/dashboard/meal-plans/create">
                    <Button className="bg-orange-600 hover:bg-orange-700 shadow-sm transition-all h-11 px-6">
                        <Plus className="mr-2 h-5 w-5" /> Create Meal Plan
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mealPlans.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full mb-4">
                            <Utensils className="h-10 w-10 text-orange-500 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 dark:text-zinc-100">No meal plans yet</h3>
                        <p className="mt-2 text-gray-500 dark:text-zinc-400 dark:text-zinc-400 text-center max-w-sm px-4">
                            Start creating meal plan templates to provide full-service support to your clients.
                        </p>
                        <Link href="/dashboard/meal-plans/create" className="mt-8">
                            <Button variant="outline" className="rounded-xl px-8 h-12 dark:hover:bg-zinc-800">
                                Create Your First Plan
                            </Button>
                        </Link>
                    </div>
                ) : (
                    mealPlans.map((plan) => {
                        let planData = { summary: { calories: 0 }, meals: [] };
                        try {
                            if (plan.content) {
                                planData = JSON.parse(plan.content);
                            }
                        } catch (e) {
                            console.error('Failed to parse plan content', e);
                        }

                        return (
                            <Card key={plan.id} className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-xl transition-all duration-300 rounded-[32px] flex flex-col h-full bg-white dark:bg-zinc-900/50">
                                <CardHeader className="p-0">
                                    <div className="h-1.5 bg-gradient-to-r from-orange-400 to-red-500 w-full" />
                                    <div className="p-8 pb-4">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-orange-50 dark:bg-orange-950/20 p-3.5 rounded-2xl group-hover:bg-orange-600 transition-colors duration-300">
                                                <Utensils className="h-6 w-6 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors duration-300" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl font-black text-gray-900 dark:text-zinc-100 dark:text-zinc-100 leading-tight">
                                                    {plan.title}
                                                </CardTitle>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 mt-1">
                                                    Modified {new Date(plan.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-8 pb-8 pt-0 flex-1 flex flex-col">
                                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100/50 dark:border-zinc-800 rounded-2xl p-4 mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Target Energy</span>
                                            <span className="text-lg font-black text-orange-600 dark:text-orange-400">{Math.round(planData.summary?.calories || 0)} kcal</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {planData.meals?.map((m: any, i: number) => (
                                                <span key={i} className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 dark:text-zinc-400">
                                                    {m.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-auto flex items-center gap-3">
                                        <Link href={`/dashboard/meal-plans/${plan.id}/edit`} className="flex-1">
                                            <Button variant="outline" className="w-full justify-center rounded-xl bg-gray-50/50 dark:bg-zinc-900 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 border-zinc-100 dark:border-zinc-800 h-12 font-black text-xs uppercase tracking-widest transition-all">
                                                <Plus className="mr-2 h-4 w-4" /> Edit Plan
                                            </Button>
                                        </Link>

                                        <form action={async () => {
                                            'use server'
                                            try {
                                                await deleteMealPlan(plan.id)
                                            } catch (e) {
                                                console.error(e)
                                            }
                                        }}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 rounded-xl text-gray-300 dark:text-zinc-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
