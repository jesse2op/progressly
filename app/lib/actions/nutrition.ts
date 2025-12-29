'use server'

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function toggleMealCompletion(assignmentId: string, mealName: string) {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT') return { error: 'Unauthorized' };

    try {
        // Fetch current assignment via raw query to be safe
        const assignments: any[] = await prisma.$queryRaw`SELECT id, completedMeals FROM MealAssignment WHERE id = ${assignmentId} LIMIT 1`;
        const assignment = assignments[0];

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

        // Update via raw query
        await prisma.$executeRaw`UPDATE MealAssignment SET completedMeals = ${completedStr} WHERE id = ${assignmentId}`;

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
        await prisma.$executeRaw`UPDATE MealAssignment SET customContent = ${customContent} WHERE id = ${assignmentId}`;
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
        const existing: any[] = await prisma.$queryRaw`SELECT id FROM MealAssignment WHERE clientId = ${clientId} AND date = ${date.toISOString()} LIMIT 1`;

        if (existing.length > 0) return existing[0].id;

        // Try to find coach's latest plan to auto-assign
        const clientProfiles: any[] = await prisma.$queryRaw`SELECT coachId FROM ClientProfile WHERE id = ${clientId} LIMIT 1`;
        const coachId = clientProfiles[0]?.coachId;

        let mealPlanId = null;
        if (coachId) {
            const plans: any[] = await prisma.$queryRaw`SELECT id FROM MealPlan WHERE coachId = ${coachId} ORDER BY updatedAt DESC LIMIT 1`;
            mealPlanId = plans[0]?.id || null;
        }

        const id = crypto.randomUUID();
        await prisma.$executeRaw`
            INSERT INTO MealAssignment (id, clientId, mealPlanId, date, completedMeals, customContent)
            VALUES (${id}, ${clientId}, ${mealPlanId}, ${date.toISOString()}, '[]', '')
        `;

        return id;
    } catch (error) {
        console.error(error);
        return null;
    }
}
