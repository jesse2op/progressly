'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const SendMessageSchema = z.object({
    receiverId: z.string(),
    content: z.string().min(1, { message: 'Message content cannot be empty.' }),
});

export async function sendMessage(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { error: 'Unauthorized' };

    const validatedFields = SendMessageSchema.safeParse({
        receiverId: formData.get('receiverId'),
        content: formData.get('content'),
    });

    if (!validatedFields.success) {
        return { error: 'Invalid fields.' };
    }

    const { receiverId, content } = validatedFields.data;

    try {
        await prisma.message.create({
            data: {
                senderId: session.user.id,
                receiverId,
                content,
            },
        });
    } catch (error) {
        console.error(error);
        return { error: 'Database Error: Failed to send message.' };
    }

    revalidatePath('/messages');
    revalidatePath('/dashboard/messages');
    return { success: true };
}

export async function markAsRead(messageId: string) {
    const session = await auth();
    if (!session) return;

    try {
        await prisma.message.update({
            where: {
                id: messageId,
                receiverId: session.user.id
            },
            data: { read: true }
        });
    } catch (error) {
        console.error(error);
    }
}
