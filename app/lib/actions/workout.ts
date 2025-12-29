'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const CreateWorkoutSchema = z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters.' }),
    description: z.string().optional(),
    exercises: z.string().optional(), // JSON string
});

export async function createWorkout(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') {
        return 'Unauthorized';
    }

    const validatedFields = CreateWorkoutSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        exercises: formData.get('exercises'),
    });

    if (!validatedFields.success) {
        return 'Invalid fields.';
    }

    const { title, description, exercises } = validatedFields.data;

    try {
        // Get Coach Profile ID
        const coachProfile = await prisma.coachProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!coachProfile) {
            return 'Coach profile not found.';
        }

        await prisma.workout.create({
            data: {
                coachId: coachProfile.id,
                title,
                description,
                exercises: exercises || '[]',
            },
        });
    } catch (error) {
        console.error(error);
        return 'Database Error: Failed to create workout.';
    }

    revalidatePath('/dashboard/workouts');
    redirect('/dashboard/workouts');
}

const AssignWorkoutSchema = z.object({
    workoutId: z.string(),
    clientId: z.string(),
    date: z.string(), // YYYY-MM-DD
});

export async function assignWorkout(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') {
        return 'Unauthorized';
    }

    const validatedFields = AssignWorkoutSchema.safeParse({
        workoutId: formData.get('workoutId'),
        clientId: formData.get('clientId'),
        date: formData.get('date'),
    });

    if (!validatedFields.success) {
        return 'Invalid fields.';
    }

    const { workoutId, clientId, date } = validatedFields.data;

    try {
        await prisma.workoutAssignment.create({
            data: {
                workoutId,
                clientId,
                date: new Date(date),
                completed: false,
            },
        });
    } catch (error) {
        console.error(error);
        return 'Database Error: Failed to assign workout.';
    }

    revalidatePath(`/dashboard/clients/${clientId}`);
    return 'Workout assigned successfully!';
}

export async function deleteWorkout(id: string) {
    const session = await auth();
    if (!session || session.user.role !== 'COACH') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.workout.delete({
            where: { id }
        });
        revalidatePath('/dashboard/workouts');
    } catch (error) {
        console.error(error);
        throw new Error('Database Error: Failed to delete workout.');
    }
}

export async function toggleWorkoutCompletion(assignmentId: string, completed: boolean) {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.workoutAssignment.update({
            where: { id: assignmentId },
            data: { completed }
        });
        revalidatePath('/home');
        revalidatePath('/workouts');
    } catch (error) {
        console.error(error);
        throw new Error('Database Error: Failed to update workout status.');
    }
}

export async function updateWorkoutFeedback(assignmentId: string, feedback: string) {
    const session = await auth();
    if (!session || session.user.role !== 'CLIENT') {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.workoutAssignment.update({
            where: { id: assignmentId },
            data: { feedback }
        });
        revalidatePath('/home');
        revalidatePath('/workouts');
    } catch (error) {
        console.error(error);
        throw new Error('Database Error: Failed to update workout feedback.');
    }
}
