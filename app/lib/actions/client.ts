'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const LinkUserSchema = z.object({
    identifier: z.string().min(2, { message: 'Please enter a username or code.' }),
});

export async function linkUserByCode(prevState: string | undefined, formData: FormData) {
    const session = await auth();
    if (!session) return 'Unauthorized';

    const validatedFields = LinkUserSchema.safeParse({
        identifier: formData.get('identifier'),
    });

    if (!validatedFields.success) {
        return 'Invalid input.';
    }

    const { identifier } = validatedFields.data;
    const role = session.user.role;

    try {
        // Find the target user and their profile based on identifier (code or username) using Prisma Client
        const targetUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { clientProfile: { code: identifier } },
                    { coachProfile: { code: identifier } }
                ]
            },
            include: {
                clientProfile: true,
                coachProfile: true
            }
        });

        if (!targetUser) return 'User not found with that identifier.';

        if (role === 'COACH') {
            // Coach is adding a Client
            if (targetUser.role !== 'CLIENT') return 'Target user is not a client.';

            const coachProfile = await prisma.coachProfile.findUnique({
                where: { userId: session.user.id },
                select: { id: true }
            });

            if (!coachProfile) return 'Coach profile not found.';

            if (targetUser.clientProfile?.coachId) return 'Client already has a coach.';

            await prisma.clientProfile.update({
                where: { userId: targetUser.id },
                data: { coachId: coachProfile.id }
            });

        } else {
            // Client is adding a Coach
            if (targetUser.role !== 'COACH') return 'Target user is not a coach.';

            const clientProfile = await prisma.clientProfile.findUnique({
                where: { userId: session.user.id },
                select: { id: true, coachId: true }
            });

            if (!clientProfile) return 'Client profile not found.';

            if (clientProfile.coachId) return 'You already have a coach.';

            if (!targetUser.coachProfile) return 'Target user is not a valid coach.';

            await prisma.clientProfile.update({
                where: { id: clientProfile.id },
                data: { coachId: targetUser.coachProfile.id }
            });
        }

    } catch (error) {
        console.error(error);
        return 'Database Error: Failed to link user.';
    }

    const redirectPath = role === 'COACH' ? '/dashboard/clients' : '/dashboard';
    revalidatePath(redirectPath);
    redirect(redirectPath);
}
