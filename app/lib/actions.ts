'use server'

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const SignupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
    role: z.enum(['COACH', 'CLIENT']),
});

const generateCode = (role: string) => {
    const prefix = role === 'COACH' ? 'PG-C-' : 'PG-A-';
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + code;
};

export async function signup(prevState: string | undefined, formData: FormData) {
    const validatedFields = SignupSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role'),
    });

    if (!validatedFields.success) {
        return 'Missing Fields. Failed to Create Account.';
    }

    const { name, email, password, role } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Username
        let baseUsername = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        let username = baseUsername;
        let count = 1;

        while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}_${count}`;
            count++;
        }

        // Generate Code
        let code = generateCode(role);
        while (role === 'COACH'
            ? await prisma.coachProfile.findUnique({ where: { code } })
            : await prisma.clientProfile.findUnique({ where: { code } })) {
            code = generateCode(role);
        }

        try {
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    username,
                    password: hashedPassword,
                    role,
                    coachProfile: role === 'COACH' ? {
                        create: { code }
                    } : undefined,
                    clientProfile: role === 'CLIENT' ? {
                        create: { code }
                    } : undefined,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                return 'An account with this email already exists';
            }
            throw error;
        }
    } catch (error) {
        console.error('Signup Error:', error);
        return 'Database Error: Failed to Create Account.';
    }

    // Automatically sign in after signup? Or redirect to login?
    // Let's redirect to login for now or try to sign in.
    // SignIn in server action might be tricky with redirects.
    // Let's just return success message or redirect manually.

    // Actually, we can use signIn here.
    try {
        await signIn('credentials', { email, password, redirectTo: role === 'COACH' ? '/dashboard' : '/home' });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: { role: true },
        });

        const redirectTo = user?.role === 'COACH' ? '/dashboard' : '/home';

        await signIn('credentials', { email, password, redirectTo });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}
