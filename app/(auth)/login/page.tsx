'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950 transition-colors duration-300">
            <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xl dark:shadow-none rounded-[32px] overflow-hidden">
                <CardHeader className="relative">
                    <Link href="/" className="absolute left-4 top-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Home className="h-4 w-4" />
                        </Button>
                    </Link>
                    <CardTitle className="text-2xl font-bold text-center dark:text-zinc-100">Login to Progressly</CardTitle>
                    <CardDescription className="text-center dark:text-zinc-400">
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={dispatch} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="flex items-center justify-between">
                            <Link href="/signup" className="text-sm text-blue-600 hover:underline">
                                Don't have an account? Sign up
                            </Link>
                        </div>
                        {errorMessage && (
                            <div className="text-red-500 text-sm">{errorMessage}</div>
                        )}
                        <LoginButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full" type="submit" disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    );
}
