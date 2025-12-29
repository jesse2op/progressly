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
        // Find the target user and their profile based on identifier (code or username) using raw query
        const users: any[] = await prisma.$queryRaw`
            SELECT 
                u.id, 
                u.role, 
                u.name,
                cp.id as clientProfileId,
                cp.coachId as clientCoachId,
                coachP.id as coachProfileId
            FROM User u
            LEFT JOIN ClientProfile cp ON cp.userId = u.id
            LEFT JOIN CoachProfile coachP ON coachP.userId = u.id
            WHERE u.username = ${identifier} 
               OR cp.code = ${identifier}
               OR coachP.code = ${identifier}
            LIMIT 1
        `;

        const targetUser = users[0];
        if (!targetUser) return 'User not found with that identifier.';

        if (role === 'COACH') {
            // Coach is adding a Client
            if (targetUser.role !== 'CLIENT') return 'Target user is not a client.';

            const coachProfiles: any[] = await prisma.$queryRaw`SELECT id FROM CoachProfile WHERE userId = ${session.user.id} LIMIT 1`;
            const coachProfile = coachProfiles[0];
            if (!coachProfile) return 'Coach profile not found.';

            if (targetUser.clientCoachId) return 'Client already has a coach.';

            await prisma.clientProfile.update({
                where: { userId: targetUser.id },
                data: { coachId: coachProfile.id }
            });

        } else {
            // Client is adding a Coach
            if (targetUser.role !== 'COACH') return 'Target user is not a coach.';

            const clientProfiles: any[] = await prisma.$queryRaw`SELECT id, coachId FROM ClientProfile WHERE userId = ${session.user.id} LIMIT 1`;
            const clientProfile = clientProfiles[0];
            if (!clientProfile) return 'Client profile not found.';

            if (clientProfile.coachId) return 'You already have a coach.';

            await prisma.clientProfile.update({
                where: { id: clientProfile.id },
                data: { coachId: targetUser.coachProfileId }
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
