import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

console.log('DEBUG: AUTH_SECRET', process.env.AUTH_SECRET ? 'Loaded' : 'Missing');
console.log('DEBUG: DATABASE_URL', process.env.DATABASE_URL);

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log('Authorize callback started');
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    console.log('Searching for user:', email);
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        console.log('User not found');
                        return null;
                    }

                    // For MVP, if password is null (e.g. OAuth user), return null
                    if (!user.password) {
                        console.log('User has no password');
                        return null;
                    }

                    console.log('Comparing passwords');
                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        console.log('Passwords match, returning user');
                        return user;
                    }
                    console.log('Passwords do not match');
                } else {
                    console.log('Invalid credentials format');
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
