import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import EditMealPlanForm from './edit-form';

export default async function EditMealPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (!session || session.user.role !== 'COACH') redirect('/login');

    const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: id }
    });

    if (!mealPlan) notFound();

    // Verify ownership
    const coachProfile = await prisma.coachProfile.findUnique({
        where: { userId: session.user.id }
    });
    if (!coachProfile || mealPlan.coachId !== coachProfile.id) {
        redirect('/dashboard/meal-plans');
    }

    let initialData = { title: mealPlan.title, meals: [] };
    try {
        if (mealPlan.content) {
            const parsed = JSON.parse(mealPlan.content);
            initialData.meals = parsed.meals || [];
        }
    } catch (e) {
        console.error('Failed to parse initial meal plan data', e);
    }

    return (
        <EditMealPlanForm
            planId={mealPlan.id}
            initialTitle={initialData.title}
            initialMeals={initialData.meals}
        />
    );
}
