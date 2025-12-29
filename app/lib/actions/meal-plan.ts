'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CreateMealPlanSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
});

export async function createMealPlan(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') {
        return 'Unauthorized';
    }

    const validatedFields = CreateMealPlanSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
    });

    if (!validatedFields.success) {
        return 'Invalid fields.';
    }

    const { title, content } = validatedFields.data;

    try {
        const coachProfile = await prisma.coachProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!coachProfile) {
            return 'Coach profile not found.';
        }

        await prisma.mealPlan.create({
            data: {
                coachId: coachProfile.id,
                title,
                content,
            },
        });
    } catch (error) {
        console.error(error);
        return 'Database Error: Failed to create meal plan.';
    }

    revalidatePath('/dashboard/meal-plans');
    redirect('/dashboard/meal-plans');
}

export async function updateMealPlan(id: string, prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') {
        return 'Unauthorized';
    }

    const validatedFields = CreateMealPlanSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
    });

    if (!validatedFields.success) {
        return 'Invalid fields.';
    }

    const { title, content } = validatedFields.data;

    try {
        await prisma.mealPlan.update({
            where: { id },
            data: {
                title,
                content,
            },
        });
    } catch (error) {
        console.error(error);
        return 'Database Error: Failed to update meal plan.';
    }

    revalidatePath('/dashboard/meal-plans');
    redirect('/dashboard/meal-plans');
}

export async function deleteMealPlan(id: string) {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.mealPlan.delete({
            where: { id }
        });
        revalidatePath('/dashboard/meal-plans');
    } catch (error) {
        console.error(error);
        throw new Error('Database Error: Failed to delete meal plan.');
    }
}
