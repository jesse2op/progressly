'use server'

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function toggleMealCompletion(assignmentId: string, mealName: string) {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT') return { error: 'Unauthorized' };

    try {
        // Fetch current assignment via Prisma Client
        const assignment = await prisma.mealAssignment.findUnique({
            where: { id: assignmentId },
            select: { id: true, completedMeals: true }
        });

        if (!assignment) return { error: 'Assignment not found' };

        let completed = [];
        try {
            completed = assignment.completedMeals ? JSON.parse(assignment.completedMeals) : [];
        } catch (e) {
            completed = [];
        }

        if (completed.includes(mealName)) {
            completed = completed.filter((m: string) => m !== mealName);
        } else {
            completed.push(mealName);
        }

        const completedStr = JSON.stringify(completed);

        // Update via Prisma Client
        await prisma.mealAssignment.update({
            where: { id: assignmentId },
            data: { completedMeals: completedStr }
        });

        revalidatePath('/home');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to update completion status.' };
    }
}

export async function updateDailyMealLog(assignmentId: string, customContent: string) {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT') return { error: 'Unauthorized' };

    try {
        await prisma.mealAssignment.update({
            where: { id: assignmentId },
            data: { customContent }
        });
        revalidatePath('/home');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to update daily log.' };
    }
}

export async function ensureDailyAssignment(clientId: string, dateStr: string) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };

    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    try {
        // Check if exists
        const existing = await prisma.mealAssignment.findFirst({
            where: {
                clientId,
                date: { equals: date } // Prisma handles Date objects correctly
            },
            select: { id: true }
        });

        if (existing) return existing.id;

        // Try to find coach's latest plan to auto-assign
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { id: clientId },
            select: { coachId: true }
        });
        const coachId = clientProfile?.coachId;

        let mealPlanId = null;
        if (coachId) {
            const plan = await prisma.mealPlan.findFirst({
                where: { coachId },
                orderBy: { updatedAt: 'desc' },
                select: { id: true }
            });
            mealPlanId = plan?.id || null;
        }

        const newAssignment = await prisma.mealAssignment.create({
            data: {
                clientId,
                mealPlanId,
                date,
                completedMeals: '[]',
                customContent: ''
            }
        });

        return newAssignment.id;
    } catch (error) {
        console.error(error);
        return null;
    }
}
